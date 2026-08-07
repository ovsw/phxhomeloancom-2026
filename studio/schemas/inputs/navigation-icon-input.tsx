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
  getLoanIcon,
  isLoanIconName,
  searchLoanIcons,
} from "../../../shared/loan-icons";
import {
  canonicalLucideIconNames,
  isCanonicalLucideIconName,
} from "./lucide-icon-catalog";
import { LoanIcon } from "./loan-icon";

const PAGE_SIZE = 60;

function IconGlyph({ name, size = 20 }: { name: string; size?: number }) {
  if (isLoanIconName(name)) {
    return <LoanIcon name={name} size={size} />;
  }
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

export function createNavigationIconPreview(name: string) {
  return function NavigationIconPreview() {
    return <IconGlyph name={name} />;
  };
}

function PickerOption({
  label,
  name,
  onSelect,
  selected,
}: {
  label: string;
  name: string;
  onSelect: (name: string) => void;
  selected: boolean;
}) {
  return (
    <Card
      aria-label={`Choose ${label}`}
      aria-pressed={selected}
      as="button"
      onClick={() => onSelect(name)}
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
          {label}
        </Text>
      </Stack>
    </Card>
  );
}

export default function NavigationIconInput(props: StringInputProps) {
  const dialogId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const selectedLoanIcon = getLoanIcon(props.value);

  const normalizedQuery = query.trim().toLowerCase().replaceAll(" ", "-");
  const filteredLoanIcons = useMemo(() => searchLoanIcons(query), [query]);
  const filteredLucideNames = useMemo(() => {
    if (!normalizedQuery) return canonicalLucideIconNames;
    return canonicalLucideIconNames.filter((name) => name.includes(normalizedQuery));
  }, [normalizedQuery]);
  const visibleLucideNames = filteredLucideNames.slice(0, limit);
  const matchingCount = filteredLoanIcons.length + filteredLucideNames.length;

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
        text={selectedLoanIcon?.title || props.value || "Choose an icon"}
        type="button"
        width="fill"
      />

      {open ? (
        <Dialog
          header="Choose a navigation icon"
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
                {matchingCount} matching icon{matchingCount === 1 ? "" : "s"}
              </Text>

              {filteredLoanIcons.length ? (
                <Stack space={3}>
                  <Text size={1} weight="semibold">
                    Custom loan icons
                  </Text>
                  <Grid columns={[2, 3, 4, 5]} gap={2}>
                    {filteredLoanIcons.map(({ title, value }) => (
                      <PickerOption
                        key={value}
                        label={title}
                        name={value}
                        onSelect={selectIcon}
                        selected={value === props.value}
                      />
                    ))}
                  </Grid>
                </Stack>
              ) : null}

              {visibleLucideNames.length ? (
                <Stack space={3}>
                  <Text size={1} weight="semibold">
                    Lucide icons
                  </Text>
                  <Grid columns={[2, 3, 4, 5]} gap={2}>
                    {visibleLucideNames.map((name) => (
                      <PickerOption
                        key={name}
                        label={name}
                        name={name}
                        onSelect={selectIcon}
                        selected={name === props.value}
                      />
                    ))}
                  </Grid>
                </Stack>
              ) : null}

              {!matchingCount ? (
                <Card padding={4} radius={2} tone="transparent">
                  <Text align="center" muted size={1}>
                    No icons match “{query}”.
                  </Text>
                </Card>
              ) : null}

              {visibleLucideNames.length < filteredLucideNames.length ? (
                <Button
                  mode="ghost"
                  onClick={() => setLimit((current) => current + PAGE_SIZE)}
                  text={`Show ${Math.min(PAGE_SIZE, filteredLucideNames.length - visibleLucideNames.length)} more`}
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
