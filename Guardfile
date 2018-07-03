ignore /^_site/ # NOTE: this can interfere with Guard::LiveReload

jekyll_plus_options = {
  :config => ['_config.yml', '_config.dev.yml'],
  :drafts => true,
  :serve  => true
}

s3_options = {
  :access_key_id      => ENV['AWS_ACCESS_KEY_ID'],
  :secret_access_key  => ENV['AWS_SECRET_ACCESS_KEY'],
  :bucket             => "nickdancer",
  :s3_permissions     => :public_read,
  :prefix             => "",
  :debug              => true
}

guard "jekyll-plus", jekyll_plus_options do
  watch /.*/
end

guard "s3", s3_options do
  watch(%r{^assets/posts/.*})
end
