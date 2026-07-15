create policy "No direct API access to AI allowance"
  on private.ai_suggestion_usage
  as restrictive
  for all
  to public
  using (false)
  with check (false);
