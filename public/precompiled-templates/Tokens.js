Handlebars.partials["Tokens"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\r\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"Token"),depth0,{"name":"Token","data":data,"indent":"                ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<!DOCTYPE html>\r\n<html>\r\n    <link rel=\"stylesheet\" href=\"/style.css\" media=\"screen\">\r\n<body>\r\n    <div id=\"token-backdrop\" class=\"hidden\">\r\n        <div class=\"token-header\">\r\n            <h3>Token Menu</h3>\r\n            <button type=\"button\" class=\"token-close\">&times;</button>\r\n        </div>\r\n        <div class=\"token-body\">\r\n            \r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"AllTokens") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":12},"end":{"line":16,"column":21}}})) != null ? stack1 : "")
    + "    \r\n        </div>\r\n    </div>\r\n</body>\r\n\r\n</html>";
},"usePartial":true,"useData":true});