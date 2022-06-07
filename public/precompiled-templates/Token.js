Handlebars.partials["Token"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\r\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"bar"),depth0,{"name":"bar","data":data,"indent":"        ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"token-main\">\r\n    <div class=\"token-name\">\r\n        <label for=\"token-name-input\"> "
    + alias4(((helper = (helper = lookupProperty(helpers,"TokenName") || (depth0 != null ? lookupProperty(depth0,"TokenName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"TokenName","hash":{},"data":data,"loc":{"start":{"line":3,"column":39},"end":{"line":3,"column":52}}}) : helper)))
    + " </label>\r\n        <input type=\"text\" id=\"token-name-input\">\r\n    </div>\r\n\r\n    <div class=\"token-nickname\">\r\n        <label for=\"token-nickname-input\"> "
    + alias4(((helper = (helper = lookupProperty(helpers,"TokenNickname") || (depth0 != null ? lookupProperty(depth0,"TokenNickname") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"TokenNickname","hash":{},"data":data,"loc":{"start":{"line":8,"column":43},"end":{"line":8,"column":60}}}) : helper)))
    + " </label>\r\n        <input type=\"text\" id=\"token-nickname-input\">\r\n    </div>\r\n    <div class=\"description\">\r\n        <label for=\"token-description-input\"> "
    + alias4(((helper = (helper = lookupProperty(helpers,"TokenDescription") || (depth0 != null ? lookupProperty(depth0,"TokenDescription") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"TokenDescription","hash":{},"data":data,"loc":{"start":{"line":12,"column":46},"end":{"line":12,"column":66}}}) : helper)))
    + " </label>\r\n        <textarea id=\"token-description-input\"></textarea>\r\n    </div>\r\n</div>\r\n<div id=\"bars\">\r\n    \r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"TokenBar") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":18,"column":4},"end":{"line":22,"column":13}}})) != null ? stack1 : "")
    + "\r\n</div>\r\n";
},"usePartial":true,"useData":true});