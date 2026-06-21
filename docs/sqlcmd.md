# snippet to add organizations

INSERT INTO public.organizations (name, slug, join_code)
VALUES (
  'CE Level 300 — 2026',
  'ce-level-300-2026',
  'CE300-X7K2'
)
RETURNING id, name, join_code;
-- Copy the returned id — you'll need it below

## assign an existing user an organization

UPDATE public.profiles
SET org_id = 'paste-org-uuid-here'
WHERE email = 'student@email.com';

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'user@email.com';

UPDATE public.profiles
SET
  org_id = 'paste-org-uuid-here',
  role   = 'admin'
WHERE email = 'user@email.com';

## Confirm the change

SELECT id, email, role, org_id FROM public.profiles
WHERE email = 'user@email.com';