import { NextResponse } from 'next/server';
import connectDB from './db';

export const json = (data, status = 200) => NextResponse.json(data, { status });

// Mirrors express.json(): a JSON body is parsed, anything else leaves the
// body undefined. Malformed JSON is a 400, as it was in Express.
export class BadJsonError extends Error {}

export const readBody = async (request) => {
  const type = request.headers.get('content-type') || '';
  if (!type.includes('application/json')) return undefined;
  const text = await request.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    throw new BadJsonError('Invalid JSON body');
  }
};

// Wraps a route handler: connects to Mongo first and turns anything that
// escapes the handler into a 500 JSON response (Express's error fallback).
export const route = (handler) => async (request, context) => {
  try {
    await connectDB();
    const params = context?.params ? await context.params : {};
    return await handler(request, params);
  } catch (error) {
    if (error instanceof BadJsonError) return json({ message: error.message }, 400);
    console.error(error);
    return json({ message: error.message }, 500);
  }
};
