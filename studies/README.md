# Studies

Each folder is one public website study.

A study should explain what was learned from the original site and provide
original, reusable demos for the most interesting techniques. It should not
contain a full clone or copied deployment assets.

Create a new study from the private `motion-director` workspace:

```bash
node scripts/scaffold-public-study.mjs <site-slug> \
  --title "<Public Study Title>" \
  --url "<original-url>"
```

