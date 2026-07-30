export type Recipient = { key: string; label: string; email: string };

/**
 * Where a brief may be sent. Entries must be services whose staff hold a
 * professional duty of confidentiality — counselling services, GP practices, NHS
 * talking therapies. Never peer or student-society inboxes: emailing someone's
 * mental-health brief there is a disclosure to peers (COMPLIANCE.md C9).
 */
const RECIPIENTS: Recipient[] = [
  {
    key: "ucl-counselling",
    label: "UCL Student Psychological & Counselling Services",
    email: "spcs-info@ucl.ac.uk",
  },
  {
    key: "candi-icope",
    label: "Camden & Islington Talking Therapies (iCope)",
    email: "candi.talkingtherapies@nhs.net",
  },
];

export const recipientList = () =>
  RECIPIENTS.map(({ key, label }) => ({ key, label }));

export const resolveRecipient = (key: string) =>
  RECIPIENTS.find((r) => r.key === key) ?? null;
