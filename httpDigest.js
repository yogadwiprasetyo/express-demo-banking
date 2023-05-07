var http = require("http");
var https = require("https");
var crypto = require("crypto");

function HTTPDigest(username, password, use_https) {
  this.username = username;
  this.password = password;
  this.use_https = use_https;
}

HTTPDigest.prototype.request = function (options, body, callback) {
  var request_method = this.use_https ? https.request : http.request;
  var self = this;

  request_method(options, function (response) {
    self._handle_response(options, response, body, callback);
  })
    .on("error", function (e) {
      console.error(e);
    })
    .end();
};

HTTPDigest.prototype._handle_response = function (
  options,
  response,
  body,
  callback
) {
  var request_method = this.use_https ? https.request : http.request;
  var challenge = this._parse_challenge(response.headers["www-authenticate"]);

  var ha1 = crypto.createHash("md5");
  ha1.update([this.username, challenge.realm, this.password].join(":"));

  var ha2 = crypto.createHash("md5");
  ha2.update([options.method, options.path].join(":"));

  var response = crypto.createHash("md5");
  response.update(
    [ha1.digest("hex"), challenge.nonce, ha2.digest("hex")].join(":")
  );

  var requestParams = {
    username: this.username,
    realm: challenge.realm,
    nonce: challenge.nonce,
    uri: options.path,
    qop: challenge.qop,
    response: response.digest("hex"),
    nc: "1",
    cnonce: "",
  };
  options.headers = options.headers || {};
  options.headers.Authorization = this._render_digest(requestParams);

  request_method(options, function (response) {
    response.setEncoding("utf8");
    var content = "";

    response
      .on("data", function (chunk) {
        content += chunk;
      })
      .on("end", function () {
        callback(content);
      });
  }).end(body);
};

HTTPDigest.prototype._parse_challenge = function (header) {
  var prefix = "Digest ";
  var challenge = header.substr(header.indexOf(prefix) + prefix.length);
  var parts = challenge.split(",");
  var length = parts.length;
  var params = {};
  for (var i = 0; i < length; i++) {
    var part = parts[i].match(/^\s*?([a-zA-Z0-0]+)="(.*)"\s*?$/);
    if (part && part.length > 2) {
      params[part[1]] = part[2];
    }
  }

  return params;
};

HTTPDigest.prototype._render_digest = function (params) {
  var parts = [];
  for (var i in params) {
    parts.push(i + '="' + params[i] + '"');
  }
  return "Digest " + parts.join(",");
};

module.exports = HTTPDigest;
