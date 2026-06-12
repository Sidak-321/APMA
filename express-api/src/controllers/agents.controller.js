import { z } from 'zod';
import * as agentsService from '../services/agents.service.js';
import { config } from '../config/index.js';
import axios from 'axios';

const createRunSchema = z.object({
  goal: z.string().min(10).max(500),
  output_type: z.enum(['prd', 'roadmap', 'brief']).default('prd'),
});

export async function createRun(req, res, next) {
  try {
    const body = createRunSchema.parse(req.body);
    const run = await agentsService.createRun(
      req.user.id,
      req.params.projectId,
      body.goal,
      body.output_type
    );

    // Set SSE headers before streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // Send run ID first so client knows which run this is
    res.write(`data: ${JSON.stringify({ type: 'run_created', run_id: run.id })}\n\n`);

    // Proxy SSE stream from Python
    const pythonResponse = await axios({
      method: 'POST',
      url: `${config.aiServiceUrl}/run-agent`,
      data: {
        goal: body.goal,
        project_id: req.params.projectId,
        user_id: req.user.id,
        output_type: body.output_type,
        run_id: run.id,
      },
      responseType: 'stream',
      timeout: 300000, // 5 min for long runs
    });

    let finalOutput = null;

    pythonResponse.data.on('data', (chunk) => {
      const text = chunk.toString();
      res.write(text);

      // Parse complete events to extract final output
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'complete') {
              finalOutput = event.content;
            }
          } catch {}
        }
      }
    });

    pythonResponse.data.on('end', async () => {
      // Save final output to DB
      if (finalOutput) {
        await agentsService.updateRun(run.id, {
          status: 'completed',
          outputJson: finalOutput.output_json,
          guardrailsPassed: finalOutput.guardrails_passed,
          tokensUsed: finalOutput.tokens_used,
        }).catch(console.error);
      } else {
        await agentsService.updateRun(run.id, { status: 'failed' }).catch(console.error);
      }
      res.end();
    });

    pythonResponse.data.on('error', async (err) => {
      console.error('Python stream error:', err.message);
      await agentsService.updateRun(run.id, { status: 'failed' }).catch(console.error);
      res.end();
    });

    // Handle client disconnect
    req.on('close', () => {
      pythonResponse.data.destroy();
    });

  } catch (err) {
    next(err);
  }
}

export async function getRuns(req, res, next) {
  try {
    const runs = await agentsService.getRuns(req.user.id, req.params.projectId);
    res.json(runs);
  } catch (err) { next(err); }
}

export async function getRun(req, res, next) {
  try {
    const run = await agentsService.getRun(req.user.id, req.params.runId);
    res.json(run);
  } catch (err) { next(err); }
}
const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8),
});

export async function forgotPassword(req, res, next) {
  try {
    const body = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword(body.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const body = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(body.email, body.code, body.newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
}