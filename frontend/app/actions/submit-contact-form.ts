"use server";

import { randomInt } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";

const FORMSPARK_ACTION_URL = "https://submit-form.com/a0or7TBtU";
const FORMSPARK_TIMEOUT_MS = 10_000;
const CONTACT_REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CONTACT_REFERENCE_LENGTH = 6;

const contactSubmissionSchema = z.object({
  email: z.email().max(320),
  message: z.string().max(5_000),
  name: z.string().trim().min(1).max(200),
  phone: z.string().max(50),
});

export type ContactFormState = {
  error: string | null;
};

function createContactReference() {
  return Array.from({ length: CONTACT_REFERENCE_LENGTH }, () =>
    CONTACT_REFERENCE_ALPHABET.charAt(
      randomInt(CONTACT_REFERENCE_ALPHABET.length),
    ),
  ).join("");
}

export async function submitContactForm(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const submission = contactSubmissionSchema.safeParse({
    email: formData.get("email"),
    message: formData.get("message"),
    name: formData.get("name"),
    phone: formData.get("phone"),
  });

  if (!submission.success) {
    return { error: "Please check the form and try again." };
  }

  const reference = createContactReference();

  try {
    const response = await fetch(FORMSPARK_ACTION_URL, {
      body: JSON.stringify({
        ...submission.data,
        reference,
        _email: {
          subject: `Contact Form Submission [${reference}]`,
        },
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: AbortSignal.timeout(FORMSPARK_TIMEOUT_MS),
    });

    if (!response.ok) {
      return { error: "Your message could not be sent. Please try again." };
    }
  } catch {
    return { error: "Your message could not be sent. Please try again." };
  }

  redirect("/contact/thanks/");
}
