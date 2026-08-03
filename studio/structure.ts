import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import {
  Files,
  BookMarked,
  FileText,
  User,
  ListCollapse,
  Quote,
  Menu,
  Settings,
  PanelBottom,
  Tag,
} from "lucide-react";

export const structure = (S: any, context: any) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Pages")
        .icon(Files)
        .schemaType("page")
        .child(
          S.documentTypeList("page")
            .title("Pages")
            .defaultOrdering([{ field: "title", direction: "asc" }])
        ),
      S.listItem()
        .title("Blog")
        .icon(BookMarked)
        .child(
          S.list()
            .title("Blog")
            .items([
              S.listItem()
                .title("Blog Index")
                .icon(BookMarked)
                .child(
                  S.editor()
                    .id("blogIndex")
                    .schemaType("blogIndex")
                    .documentId("blogIndex")
                ),
              S.listItem()
                .title("Blog Posts")
                .icon(FileText)
                .schemaType("post")
                .child(
                  S.documentTypeList("post")
                    .title("Blog Posts")
                    .defaultOrdering([
                      { field: "_createdAt", direction: "desc" },
                    ])
                ),
              orderableDocumentListDeskItem({
                type: "category",
                title: "Categories",
                icon: Tag,
                S,
                context,
              }),
              orderableDocumentListDeskItem({
                type: "author",
                title: "Authors",
                icon: User,
                S,
                context,
              }),
            ])
        ),
      orderableDocumentListDeskItem({
        type: "faq",
        title: "FAQs",
        icon: ListCollapse,
        S,
        context,
      }),
      orderableDocumentListDeskItem({
        type: "testimonial",
        title: "Testimonials",
        icon: Quote,
        S,
        context,
      }),
      S.divider({ title: "Global" }),
      S.listItem()
        .title("Navigation")
        .icon(Menu)
        .child(
          S.editor()
            .id("navigation")
            .schemaType("navigation")
            .documentId("navigation")
        ),
      S.listItem()
        .title("Site Footer")
        .icon(PanelBottom)
        .child(
          S.editor()
            .id("footer")
            .schemaType("footer")
            .documentId("footer")
        ),
      S.listItem()
        .title("Settings")
        .icon(Settings)
        .child(
          S.editor()
            .id("settings")
            .schemaType("settings")
            .documentId("settings")
        ),
    ]);
