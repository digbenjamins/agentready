export type Block =
  | { type: "p"; text: string }
  | { type: "code"; lang?: string; code: string }
  | { type: "list"; items: string[] }
  | { type: "h3"; text: string };

export type Section = {
  heading: string;
  blocks: Block[];
};

export type CheckEntry = {
  slug: string;
  checkId: string;
  category: string;
  categoryName: string;
  checkType: "AUTO" | "SEMI";
  title: string;
  summary: string;
  sections: Section[];
  furtherReading?: { label: string; url: string }[];
};
