import { EarthGlobeIcon } from "@sanity/icons/EarthGlobe";
import { useCallback } from "react";
import {
  type DocumentFieldAction,
  type DocumentFieldActionProps,
  getPublishedId,
  useEditState,
} from "sanity";
import { usePresentationParams } from "sanity/presentation";
import { useRouter } from "sanity/router";
import { getDocumentSlug, getPresentationPath } from "./routes";

export const openInPresentationAction: DocumentFieldAction = {
  name: "open-in-presentation",
  useAction: ({
    documentId,
    documentType,
    path,
  }: DocumentFieldActionProps) => {
    const document = useEditState(getPublishedId(documentId), documentType);
    const router = useRouter();
    const isPresentation = usePresentationParams(false) !== null;
    const previewPath = getPresentationPath(
      documentType,
      getDocumentSlug(document?.draft, document?.published),
    );

    const handleOpen = useCallback(() => {
      if (!previewPath) return;

      router.navigateUrl({
        path: `/presentation?preview=${encodeURIComponent(previewPath)}`,
      });
    }, [previewPath, router]);

    return {
      type: "action",
      icon: EarthGlobeIcon,
      hidden: path.length > 0 || isPresentation,
      disabled: !previewPath,
      renderAsButton: true,
      onAction: handleOpen,
      title: "Open in Presentation",
    };
  },
};
