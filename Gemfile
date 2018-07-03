source "https://rubygems.org"
ruby RUBY_VERSION

# This is the default theme for new Jekyll sites. You may change this to anything you like.
gem "minima", "~> 2.0"

# If you want to use GitHub Pages, remove the "gem "jekyll"" above and
# uncomment the line below. To upgrade, run `bundle update github-pages`.
gem "github-pages", 186, group: :jekyll_plugins

# If you have any plugins, put them here!
group :jekyll_plugins do
   gem "jekyll-feed", "~> 0.6"
end

group :development do
  gem 'rb-readline'
  gem 'guard'
  gem 'guard-s3', :git => "https://github.com/njdancer/guard-s3.git", :ref => "b4537ca"
  gem 'guard-jekyll-plus'
end
