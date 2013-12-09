(function() {


    function appendLink(themeFile) {
        var rel = "stylesheet";

        if (/\.less$/i.test(themeFile)) {
            rel += "/less";
        }

        return $("<link data-test rel='" + rel + "' href='/base/styles/web/" + themeFile + "' />").appendTo("head");
    }

    module("Application", {
        teardown: function() {
            $("head link[data-test]").remove();
        }
    });

    test('demos application', 0, function() {
        console.warn('SKIP: entire tests/demos/application.js - relies on global styles');
    });
    return;

    test("getCurrentThemeLink  returns link element of current theme", function() {
        appendLink("kendo.common.less");
        appendLink("kendo.default.less");

        var result = Application.getCurrentThemeLink();

        equal(result.length, 1);
        ok(result[0].href.indexOf("default") > 0);
    });
    test("getCurrentThemeLink returns link element if RTL and dataviz links are present", function() {
        appendLink("kendo.common.less");
        appendLink("kendo.default.less");
        appendLink("kendo.rtl.css");
        appendLink("kendo.dataviz.css");

        var result = Application.getCurrentThemeLink();

        equal(result.length, 1);
        ok(result[0].href.indexOf("default") > 0);
    });

    test("getCurrentThemeLink skips non-kendo links", function() {
        appendLink("examples.css");
        appendLink("kendo.default.css");

        var result = Application.getCurrentThemeLink();

        equal(result.length, 1);
        ok(result[0].href.indexOf("default") > 0);
    });

    test("getThemeUrl gets URL for theme based on current theme", function() {
        appendLink("kendo.default.less");

        var newThemeName = Application.getThemeUrl("bar");

        ok(/kendo\.bar\.less$/gi.test(newThemeName));
    });

    test("getThemeUrl gets URL for minified CSS themes", function() {
        appendLink("kendo.common.less");
        appendLink("kendo.default.min.css");

        var newThemeName = Application.getThemeUrl("bar");

        ok(/kendo\.bar\.min\.css$/gi.test(newThemeName));
    });

    test("getThemeUrl does not remove url parameters", function() {
        appendLink("kendo.common.less");
        appendLink("kendo.default.min.css?_t=1");

        var newThemeName = Application.getThemeUrl("bar");

        ok(/kendo\.bar\.min\.css\?_t=1$/gi.test(newThemeName));
    });

    test("replaceTheme replaces current theme with new link", function() {
        appendLink("kendo.common.less");
        appendLink("kendo.default.less");

        Application.replaceTheme("blueopal");

        var links = $("head link");

        equal(links.length, 2);
        ok(links[0].href.indexOf("common") >= 0);
        ok(links[1].href.indexOf("blueopal") >= 0);
    });

    test("replaceTheme replaces current DataViz theme with new link", function() {
        appendLink("kendo.dataviz.css");
        appendLink("kendo.dataviz.default.css");

        Application.replaceDVTheme("blueopal");

        var links = $("head link");

        equal(links.length, 2);
        ok(links[0].href.indexOf("kendo.dataviz.css") >= 0);
        ok(links[1].href.indexOf("kendo.dataviz.blueopal.css") >= 0);
    });

    test("replaceTheme changes LessCss sheets", function() {
        appendLink("kendo.common.less");
        appendLink("kendo.default.less");

        Application.replaceTheme("blueopal");

        var links = $("head link");
        var sheets = less.sheets;

        equal(sheets.length, 2);
        equal(links[0], sheets[0]);
        equal(links[1], sheets[1]);
    });

    test("replaceTheme does not add CSS files to LessCss sheets", function() {
        appendLink("kendo.common.less");
        appendLink("examples.css");
        appendLink("kendo.default.less");

        Application.replaceTheme("blueopal");

        var links = $("head link");
        var sheets = less.sheets;

        equal(sheets.length, 2);
        equal(links[0], sheets[0]);
        equal(links[2], sheets[1]);
    });
})();
