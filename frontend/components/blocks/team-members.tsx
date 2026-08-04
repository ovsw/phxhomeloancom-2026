import PortableTextRenderer from "@/components/portable-text-renderer";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import type { PAGE_QUERY_RESULT } from "@/sanity.types";
import { Mail, Phone } from "lucide-react";
import { stegaClean } from "next-sanity";
import Image from "next/image";

type TeamMembersBlock = Extract<
  NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number],
  { _type: "teamMembers" }
>;

type TeamMemberReference = NonNullable<TeamMembersBlock["members"]>[number];
type TeamMemberDocument = NonNullable<TeamMemberReference["document"]>;

type TeamMembersProps = TeamMembersBlock & {
  dataAttribute?: (path: string) => string | undefined;
  memberDataAttribute?: (
    documentId: string,
    path: string,
  ) => string | undefined;
};

function ProfileMeta({
  member,
  memberDataAttribute,
}: Readonly<{
  member: TeamMemberDocument;
  memberDataAttribute?: TeamMembersProps["memberDataAttribute"];
}>) {
  const role = stegaClean(member.role)?.trim();
  const nmlsId = stegaClean(member.nmlsId)?.trim();

  if (!(role || nmlsId)) return null;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {role ? (
        <span
          className="rounded-full bg-primary px-3 py-1.5 typo-meta-label text-primary-foreground"
          data-sanity={memberDataAttribute?.(member._id, "role")}
        >
          {member.role}
        </span>
      ) : null}
      {nmlsId ? (
        <span
          className="typo-fine-print font-medium text-muted-foreground"
          data-sanity={memberDataAttribute?.(member._id, "nmlsId")}
        >
          NMLS #{member.nmlsId}
        </span>
      ) : null}
    </div>
  );
}

function ProfileContact({
  member,
  memberDataAttribute,
}: Readonly<{
  member: TeamMemberDocument;
  memberDataAttribute?: TeamMembersProps["memberDataAttribute"];
}>) {
  const email = stegaClean(member.email)?.trim();
  const name = stegaClean(member.name)?.trim();
  const phone = stegaClean(member.phone)?.trim();

  if (!(email || phone)) return null;

  const firstName = name?.split(/\s+/)[0] || "Team Member";
  const phoneHref = phone?.replace(/[^+\d]/g, "");

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-3.5">
      {email ? (
        <a
          className="inline-flex items-center gap-2.5 rounded-[0.5625rem] border-[1.5px] border-[var(--phx-border-strong)] px-[1.125rem] py-[0.6875rem] typo-button text-foreground no-underline transition-colors hover:border-foreground hover:bg-card focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ring"
          data-sanity={memberDataAttribute?.(member._id, "email")}
          href={`mailto:${email}`}
        >
          <Mail aria-hidden="true" className="size-[1.0625rem]" strokeWidth={1.7} />
          Email {firstName}
        </a>
      ) : null}
      {phone && phoneHref ? (
        <a
          className="inline-flex items-center gap-2.5 px-1 py-[0.6875rem] typo-button text-primary no-underline transition-opacity hover:opacity-75 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ring"
          data-sanity={memberDataAttribute?.(member._id, "phone")}
          href={`tel:${phoneHref}`}
        >
          <Phone aria-hidden="true" className="size-[1.0625rem]" strokeWidth={1.7} />
          {member.phone}
        </a>
      ) : null}
    </div>
  );
}

function TeamMemberProfile({
  index,
  member,
  memberDataAttribute,
  referenceDataAttribute,
}: Readonly<{
  index: number;
  member: TeamMemberDocument;
  memberDataAttribute?: TeamMembersProps["memberDataAttribute"];
  referenceDataAttribute?: string;
}>) {
  const hasName = Boolean(stegaClean(member.name)?.trim());
  const hasRole = Boolean(stegaClean(member.role)?.trim());
  const hasBio = Boolean(member.bio?.length);
  const hasEmail = Boolean(stegaClean(member.email)?.trim());
  const hasPhone = Boolean(stegaClean(member.phone)?.trim());
  const hasImage = Boolean(member.image?.asset?._id);

  if (!(hasName || hasRole || hasImage || hasBio || hasEmail || hasPhone)) {
    return null;
  }

  const reverse = index % 2 === 1;

  return (
    <article
      className="grid items-center gap-[clamp(2rem,5vw,4.5rem)] md:grid-cols-[0.82fr_1.18fr]"
      data-sanity={referenceDataAttribute}
    >
      {hasImage && member.image ? (
        <div
          className={cn(
            "aspect-[4/5] w-full max-w-[26.25rem] overflow-hidden rounded-2xl bg-[var(--phx-navy-900)] shadow-[0_30px_66px_rgba(19,28,59,0.24)]",
            reverse && "md:order-2 md:justify-self-end",
          )}
        >
          <Image
            alt={stegaClean(member.image.alt) || ""}
            blurDataURL={member.image.asset?.metadata?.lqip || undefined}
            className="h-full w-full object-cover"
            data-sanity={memberDataAttribute?.(member._id, "image")}
            height={900}
            loading="lazy"
            placeholder={member.image.asset?.metadata?.lqip ? "blur" : undefined}
            sizes="(min-width: 768px) 42vw, min(100vw - 2rem, 420px)"
            src={urlFor(member.image).width(720).height(900).url()}
            width={720}
          />
        </div>
      ) : null}
      <div className={cn("grid gap-[1.125rem]", reverse && "md:order-1")}>
        {hasName ? (
          <h3
            className="text-balance typo-feature-heading text-foreground"
            data-sanity={memberDataAttribute?.(member._id, "name")}
          >
            {member.name}
          </h3>
        ) : null}
        <ProfileMeta
          member={member}
          memberDataAttribute={memberDataAttribute}
        />
        {hasBio ? (
          <div
            className="max-w-[35rem] text-pretty typo-body-editorial text-muted-foreground [&_p]:!my-0"
            data-sanity={memberDataAttribute?.(member._id, "bio")}
          >
            <PortableTextRenderer value={member.bio ?? []} />
          </div>
        ) : null}
        <ProfileContact
          member={member}
          memberDataAttribute={memberDataAttribute}
        />
      </div>
    </article>
  );
}

export default function TeamMembers({
  _key,
  dataAttribute,
  eyebrow,
  memberDataAttribute,
  members,
  richText,
  title,
  useCreamBackground,
}: TeamMembersProps) {
  const resolvedMembers =
    members?.filter(
      (
        member,
      ): member is TeamMemberReference & { document: TeamMemberDocument } =>
        Boolean(member.document),
    ) ?? [];

  if (!resolvedMembers.length) return null;

  const displayEyebrow = stegaClean(eyebrow)?.trim();
  const displayTitle = stegaClean(title)?.trim();
  const titleId = _key
    ? `team-members-${stegaClean(_key)}-title`
    : undefined;

  return (
    <section
      aria-labelledby={displayTitle ? titleId : undefined}
      className={cn(
        "px-4 py-[6.875rem] md:px-6 md:py-[7.375rem] lg:px-10",
        stegaClean(useCreamBackground) ? "surface-cream" : "surface-white",
      )}
      data-sanity={dataAttribute?.("useCreamBackground")}
      id="team"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-[4.75rem]">
        <header className="mx-auto grid max-w-[47.5rem] justify-items-center gap-3.5 text-center">
          {displayEyebrow ? (
            <p
              className="typo-eyebrow text-primary"
              data-sanity={dataAttribute?.("eyebrow")}
            >
              {eyebrow}
            </p>
          ) : null}
          {displayTitle ? (
            <h2
              className="text-balance typo-section-heading text-foreground"
              data-sanity={dataAttribute?.("title")}
              id={titleId}
            >
              {title}
            </h2>
          ) : null}
          {richText?.length ? (
            <div
              className="text-pretty typo-body-editorial text-muted-foreground [&_p]:!my-0"
              data-sanity={dataAttribute?.("richText")}
            >
              <PortableTextRenderer value={richText} />
            </div>
          ) : null}
        </header>
        <div className="grid gap-16">
          {resolvedMembers.map((member, index) => {
            const memberPath = member._key
              ? `members[_key=="${member._key}"]`
              : `members[${index}]`;

            return (
              <TeamMemberProfile
                index={index}
                key={member._key ?? member.document._id}
                member={member.document}
                memberDataAttribute={memberDataAttribute}
                referenceDataAttribute={dataAttribute?.(memberPath)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
