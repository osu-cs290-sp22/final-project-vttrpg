Handlebars.partials["bar"] = Handlebars.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"bar\">\r\n    <div class=\"bar-header\">\r\n        <input type=\"color\" id=\"barcolor\" name=\"barcolor\" value="
    + alias4(((helper = (helper = lookupProperty(helpers,"BarColorValue") || (depth0 != null ? lookupProperty(depth0,"BarColorValue") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"BarColorValue","hash":{},"data":data,"loc":{"start":{"line":3,"column":64},"end":{"line":3,"column":81}}}) : helper)))
    + ">\r\n        <h3>"
    + alias4(((helper = (helper = lookupProperty(helpers,"BarName") || (depth0 != null ? lookupProperty(depth0,"BarName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"BarName","hash":{},"data":data,"loc":{"start":{"line":4,"column":12},"end":{"line":4,"column":23}}}) : helper)))
    + "</h3>\r\n        <!--<h3>"
    + alias4(((helper = (helper = lookupProperty(helpers,"AttributeName") || (depth0 != null ? lookupProperty(depth0,"AttributeName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"AttributeName","hash":{},"data":data,"loc":{"start":{"line":5,"column":16},"end":{"line":5,"column":33}}}) : helper)))
    + "</h3>-->\r\n    </div>\r\n    <input type=\"number\" id=\"bar-current\">\r\n    <label for=\"bar-max\">/</label>\r\n    <input type=\"number\" id=\"bar-max\">\r\n    <!--<input type=\"text\" id=\"bar-name\"></textarea>-->\r\n</div>\r\n";
},"useData":true});