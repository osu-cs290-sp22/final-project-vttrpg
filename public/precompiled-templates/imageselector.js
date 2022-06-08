Handlebars.partials["imageselector"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <img class=\"token_image\" src="
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"image") || (depth0 != null ? lookupProperty(depth0,"image") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"image","hash":{},"data":data,"loc":{"start":{"line":8,"column":33},"end":{"line":8,"column":42}}}) : helper)))
    + " width=\"64\" height= \"64\">\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div id=\"image_selector_modal\" class=\"menu\">\n    <button id=\"close-image-selector\">Close</button>\n    <div class=\"image_selector_header\">\n        <h2>Select an Image to draw with</h2>\n    </div>\n<div id=\"token_image_container\">\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"images") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":4},"end":{"line":9,"column":13}}})) != null ? stack1 : "")
    + "</div>\n</div>\n<button id=\"close-image-selector\">Close</button> ";
},"useData":true});