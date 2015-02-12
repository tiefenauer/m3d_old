if [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  echo -e "Starting to update gh-pages\n"

  #clone gh-pages
  rm -rf gh-pages
  git clone --quiet --branch=gh-pages https://${GH_TOKEN}@github.com/tiefenauer/m3d.git  gh-pages > /dev/null

  #bestehende Metriken ins Arbeitsverzeichnis kopieren (für History)
  mkdir reports
  mkdir reports/metrics
  mkdir reports/coverage
  mkdir reports/jshint
  mkdir assets/
  mkdir assets/gemeinden  
  cp -Rf gh-pages/metrics/* reports/metrics

  #Metriken neu erstellen
  npm run metrics

  mkdir gh-pages/metrics
  mkdir gh-pages/coverage
  mkdir gh-pages/tests/unit
  mkdir gh-pages/tests/e2e
  mkdir gh-pages/jshint
  mkdir gh-pages/doc
  mkdir gh-pages/assets
  mkdir gh-pages/assets/gemeinden  
  cp -R reports/metrics/* gh-pages/metrics
  cp -R reports/coverage/report-html/* gh-pages/coverage
  cp -R reports/tests/* gh-pages/tests
  cp -R reports/jshint/* gh-pages/jshint
  cp -R reports/doc/* gh-pages/doc
  cp -R app/assets/gemeinden/* gh-pages/assets/gemeinden  
  cp -R dist/* gh-pages

  #go to updated pages and setup git
  cd gh-pages
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis"

  #add, commit and push files
  git add -f .
  git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed to gh-pages"
  git push -fq origin gh-pages > /dev/null

  echo -e "Done magic with coverage\n"
fi