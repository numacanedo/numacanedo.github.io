git add  .
git commit -m "dist files"
git tag -d v1
git tag -a -m "" v1
git push --follow-tags
