// documents
import page from "./schemas/documents/page";
import post from "./schemas/documents/post";
import author from "./schemas/documents/author";
import category from "./schemas/documents/category";
import faq from "./schemas/documents/faq";
import testimonial from "./schemas/documents/testimonial";
import navigation from "./schemas/documents/navigation";
import settings from "./schemas/documents/settings";

// Schema UI shared objects
import blockContent from "./schemas/blocks/shared/block-content";
import link from "./schemas/blocks/shared/link";
import { colorVariant } from "./schemas/blocks/shared/color-variant";
import { buttonVariant } from "./schemas/blocks/shared/button-variant";
import sectionPadding from "./schemas/blocks/shared/section-padding";
import customUrl from "./schemas/blocks/shared/custom-url";
import button from "./schemas/blocks/shared/button";
// Schema UI objects
import hero1 from "./schemas/blocks/hero/hero-1";
import homeHero from "./schemas/blocks/home-hero";
import loanFeatureCards from "./schemas/blocks/loan-feature-cards";
import videoFeature from "./schemas/blocks/video-feature";
import phxEmbedSocialReviews from "./schemas/blocks/phx-embed-social-reviews";
import latestArticles from "./schemas/blocks/latest-articles";
import faqAccordion from "./schemas/blocks/faq-accordion";

export const schemaTypes = [
  // documents
  page,
  post,
  author,
  category,
  faq,
  testimonial,
  navigation,
  settings,
  // shared objects
  blockContent,
  link,
  colorVariant,
  buttonVariant,
  sectionPadding,
  customUrl,
  button,
  // blocks
  hero1,
  homeHero,
  loanFeatureCards,
  videoFeature,
  phxEmbedSocialReviews,
  latestArticles,
  faqAccordion,
];
