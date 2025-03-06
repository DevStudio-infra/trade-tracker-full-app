"use client";

import * as Sentry from "@sentry/nextjs";

export default function TestSentry() {
  const throwError = () => {
    throw new Error("Test Sentry Error");
  };

  const captureError = () => {
    try {
      throw new Error("Test Sentry Message");
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  return (
    <>
    {/**


    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Test Sentry Integration</h1>
      <div className="flex gap-4">
        <button
          onClick={throwError}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Throw Error
        </button>
        <button
          onClick={captureError}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Capture Error
        </button>
      </div>
    </div>

     */}
    </>
  );
}
