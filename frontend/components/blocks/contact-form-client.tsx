"use client";

import type {
  ContactFormBlock,
  ContactFormDataAttributes,
  ContactFormInputCopy,
} from "@/components/blocks/contact-form.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { stegaClean } from "next-sanity";
import { useId, useRef, useState } from "react";

type ContactFormClientProps = ContactFormBlock & {
  dataAttributes?: ContactFormDataAttributes;
};

const inputClassName =
  "min-h-12 w-full rounded-[9px] border-[1.5px] border-slate-300 bg-[#fbf9f4] px-4 py-3.5 text-[15px] text-slate-950 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus-visible:border-cyan-700 focus-visible:ring-4 focus-visible:ring-cyan-700/15";

function inputCopy(
  field: ContactFormInputCopy | null,
  fallbackLabel: string,
) {
  const cleanLabel = stegaClean(field?.label)?.trim();
  const cleanPlaceholder = stegaClean(field?.placeholder)?.trim();

  return {
    label: cleanLabel ? (field?.label ?? cleanLabel) : fallbackLabel,
    placeholder: cleanPlaceholder
      ? (field?.placeholder ?? cleanPlaceholder)
      : "",
  };
}

export function updateUnavailableMessageVisibility(
  form: Pick<HTMLFormElement, "reportValidity"> | null,
  setVisible: (visible: boolean) => void,
) {
  setVisible(Boolean(form?.reportValidity()));
}

export default function ContactFormClient({
  dataAttributes,
  description,
  emailField,
  eyebrow,
  formTitle,
  messageField,
  nameField,
  officeHours,
  officeHoursTitle,
  phoneField,
  privacyNote,
  submitLabel,
  title,
  unavailableMessage,
  useCreamBackground,
}: ContactFormClientProps) {
  const generatedId = useId();
  const idPrefix = `contact-${generatedId}`;
  const titleId = `${idPrefix}-title`;
  const formTitleId = `${idPrefix}-form-title`;
  const availabilityId = `${idPrefix}-availability`;
  const statusId = `${idPrefix}-status`;
  const formRef = useRef<HTMLFormElement>(null);
  const [showUnavailableMessage, setShowUnavailableMessage] = useState(false);
  const displayTitle = stegaClean(title)?.trim();
  const displayEyebrow = stegaClean(eyebrow)?.trim();
  const displayDescription = stegaClean(description)?.trim();
  const displayOfficeHoursTitle = stegaClean(officeHoursTitle)?.trim();
  const cleanFormTitle = stegaClean(formTitle)?.trim();
  const cleanSubmitLabel = stegaClean(submitLabel)?.trim();
  const cleanUnavailableMessage = stegaClean(unavailableMessage)?.trim();
  const displayFormTitle = cleanFormTitle
    ? (formTitle ?? cleanFormTitle)
    : "Send us a message";
  const displaySubmitLabel = cleanSubmitLabel
    ? (submitLabel ?? cleanSubmitLabel)
    : "Send message";
  const displayUnavailableMessage = cleanUnavailableMessage
    ? (unavailableMessage ?? cleanUnavailableMessage)
    : "Online submission is not available yet. Please contact us directly.";
  const nameCopy = inputCopy(nameField, "Name");
  const emailCopy = inputCopy(emailField, "Email");
  const phoneCopy = inputCopy(phoneField, "Phone");
  const messageCopy = inputCopy(messageField, "Message");
  const visibleOfficeHours =
    officeHours
      ?.map((row, index) => ({
        index,
        row,
        days: stegaClean(row.days)?.trim(),
        hours: stegaClean(row.hours)?.trim(),
      }))
      .filter(
        (item): item is typeof item & { days: string; hours: string } =>
          Boolean(item.days && item.hours),
      ) ?? [];

  return (
    <section
      aria-labelledby={displayTitle ? titleId : undefined}
      className={cn(
        "border-b border-slate-200 py-20 md:py-[5.5rem] lg:pb-[6.875rem]",
        stegaClean(useCreamBackground) ? "bg-[#f7f4ed]" : "bg-white",
      )}
    >
      <div className="container grid gap-12 min-[901px]:grid-cols-[0.9fr_1.25fr] min-[901px]:items-start min-[901px]:gap-[clamp(2rem,5vw,5rem)]">
        <div className="grid gap-11">
          <div className="grid gap-4">
            {displayEyebrow ? (
              <p
                className="text-[13px] font-semibold uppercase tracking-[0.22em] text-cyan-800"
                data-sanity={dataAttributes?.eyebrow}
              >
                {eyebrow}
              </p>
            ) : null}
            {displayTitle ? (
              <h1
                className="max-w-2xl text-balance text-[clamp(2.5rem,4vw,3.5rem)] font-semibold leading-[1.1] tracking-[-0.015em] text-slate-950"
                data-sanity={dataAttributes?.title}
                id={titleId}
              >
                {title}
              </h1>
            ) : null}
            {displayDescription ? (
              <p
                className="max-w-xl text-pretty text-lg leading-[1.65] text-slate-600"
                data-sanity={dataAttributes?.description}
              >
                {description}
              </p>
            ) : null}
          </div>

          {displayOfficeHoursTitle && visibleOfficeHours.length ? (
            <div>
              <h2
                className="mb-4 text-lg font-semibold text-slate-950"
                data-sanity={dataAttributes?.officeHoursTitle}
              >
                {officeHoursTitle}
              </h2>
              <dl className="border-t border-slate-200 text-[14.5px] text-slate-600">
                {visibleOfficeHours.map(({ index, row }) => (
                  <div
                    className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-slate-200 py-[13px]"
                    key={row._key}
                  >
                    <dt data-sanity={dataAttributes?.officeHours?.[index]?.days}>
                      {row.days}
                    </dt>
                    <dd
                      className="text-right font-semibold text-slate-950"
                      data-sanity={dataAttributes?.officeHours?.[index]?.hours}
                    >
                      {row.hours}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_20px_48px_rgba(19,28,59,0.07)] md:p-12">
          {/* Keep controls unnamed and non-submitting until server-side delivery exists. */}
          <form
            aria-describedby={availabilityId}
            aria-labelledby={formTitleId}
            className="grid gap-[22px]"
            ref={formRef}
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <h2
              className="text-[26px] font-semibold text-slate-950"
              data-sanity={dataAttributes?.formTitle}
              id={formTitleId}
            >
              {displayFormTitle}
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2" htmlFor={`${idPrefix}-name`}>
                <span
                  className="text-[13px] font-semibold tracking-[0.02em] text-slate-950"
                  data-sanity={dataAttributes?.nameField?.label}
                >
                  {nameCopy.label}
                </span>
                <input
                  autoComplete="name"
                  className={inputClassName}
                  data-sanity={dataAttributes?.nameField?.placeholder}
                  id={`${idPrefix}-name`}
                  placeholder={nameCopy.placeholder}
                  required
                  type="text"
                />
              </label>
              <label className="grid gap-2" htmlFor={`${idPrefix}-email`}>
                <span
                  className="text-[13px] font-semibold tracking-[0.02em] text-slate-950"
                  data-sanity={dataAttributes?.emailField?.label}
                >
                  {emailCopy.label}
                </span>
                <input
                  autoComplete="email"
                  className={inputClassName}
                  data-sanity={dataAttributes?.emailField?.placeholder}
                  id={`${idPrefix}-email`}
                  placeholder={emailCopy.placeholder}
                  required
                  type="email"
                />
              </label>
            </div>

            <label className="grid gap-2" htmlFor={`${idPrefix}-phone`}>
              <span
                className="text-[13px] font-semibold tracking-[0.02em] text-slate-950"
                data-sanity={dataAttributes?.phoneField?.label}
              >
                {phoneCopy.label}
              </span>
              <input
                autoComplete="tel"
                className={inputClassName}
                data-sanity={dataAttributes?.phoneField?.placeholder}
                id={`${idPrefix}-phone`}
                placeholder={phoneCopy.placeholder}
                type="tel"
              />
            </label>

            <label className="grid gap-2" htmlFor={`${idPrefix}-message`}>
              <span
                className="text-[13px] font-semibold tracking-[0.02em] text-slate-950"
                data-sanity={dataAttributes?.messageField?.label}
              >
                {messageCopy.label}
              </span>
              <textarea
                className={`${inputClassName} min-h-[120px] resize-y leading-relaxed`}
                data-sanity={dataAttributes?.messageField?.placeholder}
                id={`${idPrefix}-message`}
                placeholder={messageCopy.placeholder}
                rows={5}
              />
            </label>

            <div className="flex flex-wrap items-center gap-[18px]">
              <Button
                className="h-12 rounded-[9px] bg-cyan-700 px-8 text-[15.5px] text-white hover:bg-cyan-600"
                data-sanity={dataAttributes?.submitLabel}
                aria-controls={statusId}
                aria-describedby={availabilityId}
                onClick={() => {
                  updateUnavailableMessageVisibility(
                    formRef.current,
                    setShowUnavailableMessage,
                  );
                }}
                type="button"
              >
                {displaySubmitLabel}
              </Button>
              {stegaClean(privacyNote)?.trim() ? (
                <p
                  className="text-[13px] text-slate-500"
                  data-sanity={dataAttributes?.privacyNote}
                >
                  {privacyNote}
                </p>
              ) : null}
            </div>

            <p className="sr-only" id={availabilityId}>
              {displayUnavailableMessage}
            </p>
            <noscript>
              <p
                className="text-sm text-cyan-800"
                data-sanity={dataAttributes?.unavailableMessage}
              >
                {displayUnavailableMessage}
              </p>
            </noscript>
            <p
              aria-atomic="true"
              aria-live="polite"
              className={showUnavailableMessage ? "text-sm text-cyan-800" : "sr-only"}
              data-sanity={dataAttributes?.unavailableMessage}
              id={statusId}
              role="status"
            >
              {showUnavailableMessage ? displayUnavailableMessage : ""}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
