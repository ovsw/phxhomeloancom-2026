import { Search } from "lucide-react";
import {
  DynamicIcon,
  type IconName,
} from "lucide-react/dynamic.mjs";
import { useId, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  Stack,
  Text,
  TextInput,
} from "@sanity/ui";
import { set, type StringInputProps } from "sanity";
import {
  canonicalLucideIconNames,
  isCanonicalLucideIconName,
} from "./lucide-icon-catalog";

const PAGE_SIZE = 60;

function IconGlyph({ name, size = 20 }: { name: string; size?: number }) {
  if (!isCanonicalLucideIconName(name)) return null;

  return (
    <DynamicIcon
      aria-hidden="true"
      name={name as IconName}
      size={size}
      strokeWidth={1.75}
    />
  );
}

export function createLucideIconPreview(name: string) {
  return function LucideIconPreview() {
    return <IconGlyph name={name} />;
  };
}

export default function LucideIconInput(props: StringInputProps) {
  const dialogId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const filteredNames = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase().replaceAll(" ", "-");
    if (!normalizedQuery) return canonicalLucideIconNames;
    return canonicalLucideIconNames.filter((name) => name.includes(normalizedQuery));
  }, [query]);
  const visibleNames = filteredNames.slice(0, limit);

  const close = () => setOpen(false);
  const openPicker = () => {
    setQuery("");
    setLimit(PAGE_SIZE);
    setOpen(true);
  };
  const selectIcon = (name: string) => {
    props.onChange(set(name));
    close();
  };

  return (
    <>
      <Button
        disabled={props.readOnly}
        icon={props.value ? <IconGlyph name={props.value} /> : undefined}
        id={props.elementProps.id}
        mode="ghost"
        onBlur={props.elementProps.onBlur}
        onClick={openPicker}
        onFocus={props.elementProps.onFocus}
        text={props.value || "Choose a Lucide icon"}
        type="button"
        width="fill"
      />

      {open ? (
        <Dialog
          header="Choose a Lucide icon"
          id={dialogId}
          onClose={close}
          width={4}
        >
          <Box padding={4}>
            <Stack space={4}>
              <TextInput
                autoFocus
                icon={Search}
                onChange={(event) => {
                  setQuery(event.currentTarget.value);
                  setLimit(PAGE_SIZE);
                }}
                placeholder="Search icons by name"
                value={query}
              />

              <Text muted size={1}>
                {filteredNames.length} matching icon
                {filteredNames.length === 1 ? "" : "s"}
              </Text>

              {visibleNames.length ? (
                <Grid columns={[2, 3, 4, 5]} gap={2}>
                  {visibleNames.map((name) => {
                    const selected = name === props.value;
                    return (
                      <Card
                        aria-label={`Choose ${name}`}
                        aria-pressed={selected}
                        as="button"
                        key={name}
                        onClick={() => selectIcon(name)}
                        padding={3}
                        pressed={selected}
                        radius={2}
                        style={{ cursor: "pointer", minHeight: 82 }}
                        tone={selected ? "primary" : "default"}
                        type="button"
                      >
                        <Stack space={3}>
                          <Flex justify="center">
                            <IconGlyph name={name} size={24} />
                          </Flex>
                          <Text align="center" size={1} textOverflow="ellipsis">
                            {name}
                          </Text>
                        </Stack>
                      </Card>
                    );
                  })}
                </Grid>
              ) : (
                <Card padding={4} radius={2} tone="transparent">
                  <Text align="center" muted size={1}>
                    No icons match “{query}”.
                  </Text>
                </Card>
              )}

              {visibleNames.length < filteredNames.length ? (
                <Button
                  mode="ghost"
                  onClick={() => setLimit((current) => current + PAGE_SIZE)}
                  text={`Show ${Math.min(PAGE_SIZE, filteredNames.length - visibleNames.length)} more`}
                  type="button"
                  width="fill"
                />
              ) : null}
            </Stack>
          </Box>
        </Dialog>
      ) : null}
    </>
  );
}
