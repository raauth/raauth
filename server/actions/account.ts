"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { normalizeUsername, validateUsername } from "@/lib/username-availability";

type ActionError = {
  code: string;
  message?: string;
};

type ActionResult<T> = {
  data: T | null;
  error: ActionError | null;
};

type UsernameAvailabilityCacheEntry = {
  available: boolean;
  expiresAt: number;
};

const USERNAME_SERVER_CACHE_TTL_MS = 45_000;
const USERNAME_SERVER_CACHE_MAX_ENTRIES = 500;
const usernameAvailabilityServerCache = new Map<
  string,
  UsernameAvailabilityCacheEntry
>();

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  return null;
}

function readPathString(
  value: unknown,
  path: readonly string[],
): string | undefined {
  let current: unknown = value;

  for (const key of path) {
    const record = asRecord(current);

    if (!record || !(key in record)) {
      return undefined;
    }

    current = record[key];
  }

  if (typeof current !== "string" || current.trim().length === 0) {
    return undefined;
  }

  return current;
}

function resolveCallbackURL(callbackURL?: string) {
  if (!callbackURL) {
    return undefined;
  }

  const trimmedURL = callbackURL.trim();

  if (!trimmedURL) {
    return undefined;
  }

  if (trimmedURL.startsWith("http://") || trimmedURL.startsWith("https://")) {
    return trimmedURL;
  }

  const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_URL;

  if (!baseURL) {
    return trimmedURL;
  }

  try {
    return new URL(trimmedURL, baseURL).toString();
  } catch {
    return trimmedURL;
  }
}

function mapActionError(error: unknown): ActionError {
  const code =
    readPathString(error, ["body", "code"]) ||
    readPathString(error, ["error", "code"]) ||
    readPathString(error, ["cause", "code"]) ||
    readPathString(error, ["code"]) ||
    "UNKNOWN_ERROR";

  const message =
    readPathString(error, ["body", "message"]) ||
    readPathString(error, ["error", "message"]) ||
    readPathString(error, ["cause", "message"]) ||
    readPathString(error, ["message"]);

  return {
    code,
    message,
  };
}

function getCachedUsernameAvailability(
  username: string,
): { available: boolean } | null {
  const now = Date.now();
  const cached = usernameAvailabilityServerCache.get(username);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= now) {
    usernameAvailabilityServerCache.delete(username);
    return null;
  }

  return {
    available: cached.available,
  };
}

function setCachedUsernameAvailability(username: string, available: boolean) {
  if (usernameAvailabilityServerCache.size >= USERNAME_SERVER_CACHE_MAX_ENTRIES) {
    const oldestKey = usernameAvailabilityServerCache.keys().next().value;

    if (oldestKey) {
      usernameAvailabilityServerCache.delete(oldestKey);
    }
  }

  usernameAvailabilityServerCache.set(username, {
    available,
    expiresAt: Date.now() + USERNAME_SERVER_CACHE_TTL_MS,
  });
}

function ok<T>(data: T): ActionResult<T> {
  return {
    data,
    error: null,
  };
}

function fail<T>(error: unknown): ActionResult<T> {
  return {
    data: null,
    error: mapActionError(error),
  };
}

export async function checkUsernameAvailabilityAction(input: {
  username: string;
}): Promise<ActionResult<{ available: boolean }>> {
  const normalizedUsername = normalizeUsername(input.username);
  const validation = validateUsername(normalizedUsername);

  if (!validation.isValid) {
    return ok({
      available: false,
    });
  }

  const cached = getCachedUsernameAvailability(normalizedUsername);

  if (cached) {
    return ok(cached);
  }

  try {
    const data = await auth.api.isUsernameAvailable({
      body: {
        username: normalizedUsername,
      },
      headers: await headers(),
    });

    setCachedUsernameAvailability(normalizedUsername, data.available);

    return ok({
      available: data.available,
    });
  } catch (error) {
    return fail(error);
  }
}

export async function updateProfileAction(input: {
  name: string;
  username?: string;
}): Promise<ActionResult<{ status: boolean }>> {
  const name = input.name.trim();
  const normalizedUsername = normalizeUsername(input.username ?? "");

  if (!name) {
    return {
      data: null,
      error: {
        code: "INVALID_INPUT",
      },
    };
  }

  if (normalizedUsername) {
    const validation = validateUsername(normalizedUsername);

    if (!validation.isValid) {
      return {
        data: null,
        error: {
          code: "INVALID_USERNAME",
        },
      };
    }
  }

  try {
    const data = await auth.api.updateUser({
      body: {
        name,
        username: normalizedUsername || undefined,
      },
      headers: await headers(),
    });

    if (normalizedUsername) {
      setCachedUsernameAvailability(normalizedUsername, true);
    }

    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult<{ token: string | null }>> {
  try {
    const data = await auth.api.changePassword({
      body: {
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });

    return ok({
      token: data.token,
    });
  } catch (error) {
    return fail(error);
  }
}

export async function setPasswordAction(input: {
  newPassword: string;
}): Promise<ActionResult<{ status: boolean }>> {
  try {
    const data = await auth.api.setPassword({
      body: {
        newPassword: input.newPassword,
      },
      headers: await headers(),
    });

    return ok(data);
  } catch (error) {
    const mapped = mapActionError(error);

    if (
      mapped.code === "BAD_REQUEST" &&
      mapped.message?.toLowerCase().includes("already has a password")
    ) {
      return {
        data: null,
        error: {
          code: "PASSWORD_ALREADY_DEFINED",
        },
      };
    }

    return {
      data: null,
      error: mapped,
    };
  }
}

export async function changeEmailAction(input: {
  newEmail: string;
  callbackURL?: string;
}): Promise<ActionResult<{ status: boolean }>> {
  try {
    const data = await auth.api.changeEmail({
      body: {
        newEmail: input.newEmail.trim(),
        callbackURL: resolveCallbackURL(input.callbackURL),
      },
      headers: await headers(),
    });

    return ok({ status: data.status });
  } catch (error) {
    return fail(error);
  }
}

export async function deleteAccountAction(input: {
  password: string;
}): Promise<ActionResult<{ success: boolean; message: string }>> {
  try {
    const data = await auth.api.deleteUser({
      body: {
        password: input.password,
      },
      headers: await headers(),
    });

    if (!data.success) {
      return {
        data: null,
        error: {
          code: "DELETE_USER_FAILED",
          message: data.message,
        },
      };
    }

    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function enableTwoFactorAction(input: {
  password: string;
}): Promise<ActionResult<{ totpURI: string; backupCodes: string[] }>> {
  try {
    const data = await auth.api.enableTwoFactor({
      body: {
        password: input.password,
      },
      headers: await headers(),
    });

    return ok({
      totpURI: data.totpURI,
      backupCodes: data.backupCodes,
    });
  } catch (error) {
    return fail(error);
  }
}

export async function disableTwoFactorAction(input: {
  password: string;
}): Promise<ActionResult<{ status: boolean }>> {
  try {
    const data = await auth.api.disableTwoFactor({
      body: {
        password: input.password,
      },
      headers: await headers(),
    });

    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function listPasskeysAction(): Promise<
  ActionResult<
    Array<{
      id: string;
      name?: string | null;
      createdAt?: string | Date | null;
      deviceType?: string | null;
      backedUp?: boolean;
    }>
  >
> {
  try {
    const data = await auth.api.listPasskeys({
      headers: await headers(),
    });

    return ok(
      data.map((passkey) => ({
        id: passkey.id,
        name: passkey.name ?? null,
        createdAt: passkey.createdAt ?? null,
        deviceType: passkey.deviceType ?? null,
        backedUp: passkey.backedUp ?? undefined,
      })),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function deletePasskeyAction(input: {
  id: string;
}): Promise<ActionResult<{ status: boolean }>> {
  try {
    const data = await auth.api.deletePasskey({
      body: {
        id: input.id,
      },
      headers: await headers(),
    });

    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
