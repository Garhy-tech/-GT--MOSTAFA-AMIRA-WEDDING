# GARHY INVITE — Production Status

Updated: 2026-08-15

## Production

- Project: `mostafa-amira-2026`
- Project ID: `prj_7r5uJUxlMQ6odx99vehYHYBIXJC3`
- Active V2 deployment: `dpl_3LGFndiGU1fJrL4gLi3Gr9hLN7UV`
- Production URL: `https://mostafa-amira-2026.vercel.app`
- Rollback deployment retained: `dpl_4f4Eed6xebXjMA8fX1jcVjRAH4bT`

## GARHY custom domain

- Target custom domain: `invite.garhy.ai`
- Vercel project assignment: completed
- Apex registrar: third party
- DNS provider detected by authoritative nameservers: Cloudflare
  - `alexandra.ns.cloudflare.com`
  - `carmelo.ns.cloudflare.com`
- DNS status: pending
- Required DNS record reported by Vercel:
  - Type: `A`
  - Name/Host: `invite`
  - Target/IPv4: `76.76.21.21`
  - Recommended Cloudflare proxy state during verification: DNS only
  - TTL: Auto

Do not modify the apex `garhy.ai` record or existing GARHY website DNS as part of this subdomain binding.

## Next release gate

After the DNS record resolves:
1. Verify `invite.garhy.ai` in Vercel.
2. Confirm HTTPS/SSL.
3. Confirm GARHY INVITE V2 signature and security headers on the custom domain.
4. Update canonical/share URLs to `https://invite.garhy.ai`.
5. Prepare the GARHY portfolio entry for the flagship case study.
