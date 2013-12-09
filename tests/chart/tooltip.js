(function() {
    var dataviz = kendo.dataviz,
        TOLERANCE = 1;

    (function() {
        var tooltip,
            element,
            chartElement,
            dataPointMock,
            RED = "rgb(255,0,0)",
            GREEN = "rgb(0,255,0)",
            BLUE = "rgb(0,0,255)";

        function createTooltip(options) {
            chartElement = $("<div id='chart'></div>").appendTo(QUnit.fixture);
            tooltip = new dataviz.Tooltip(chartElement, options);
            element = tooltip.element;
            element.css({ width: "45px", height: "35px" });
        }

        function destroyTooltip() {
            chartElement.remove();
        }

        function showNow(point) {
            tooltip.show(point);
        }

        function createPoint(options) {
            dataPointMock = {
                value: 1,
                box: new dataviz.Box2D(0, 0, 10, 10),
                options: {
                    aboveAxis: true,
                    color: RED
                },
                series: {
                    name: "series",
                    labels: {
                        color: GREEN
                    }
                },
                category: "category",
                dataItem: {
                    field: "value"
                },
                tooltipAnchor: function() {
                    return new dataviz.Point2D();
                },
                owner: {
                    formatPointValue: function(value, tooltipFormat) {
                        return kendo.dataviz.autoFormat(tooltipFormat, value);
                    }
                },
                formatValue: function(format) {
                    var point = this;

                    return point.owner.formatPointValue(point.value, format);
                }
            };

            $.extend(dataPointMock, options);
        }

        // ------------------------------------------------------------
        module("Tooltip", {
            setup: function() {
                createTooltip();
                createPoint();
            },
            teardown: destroyTooltip
        });

        test("attaches to chart element", function() {
            ok(element[0].parentNode === document.getElementById("chart"));
        });

        test("renders div with display none attribute", function() {
            ok(element.css("display"), "none");
        });

        test("sets font", function() {
            createTooltip({ font: "16px Tahoma" });
            equal(element.css("fontSize"), "16px");
            equal(element.css("fontFamily"), "Tahoma");
        });

        test("sets series tooltip font", function() {
            createTooltip();
            showNow(kendo.deepExtend({}, dataPointMock, {
                options: {
                    tooltip: {
                        font: "16px Tahoma"
                    }
                }
            }));
            equal(element.css("fontSize"), "16px");
            equal(element.css("fontFamily"), "Tahoma");
        });

        test("sets border width", function() {
            createTooltip({ border: { width: 1 } });
            equal(element.css("border-top-width"), "1px");
        });

        test("sets opacity", function() {
            createTooltip({ opacity: 0.5 });
            equal(element.css("opacity"), 0.5);
        });

        asyncTest("show displays tooltip for last point with a delay", function() {
            tooltip.show(dataPointMock);

            setTimeout(function() {
                equal(element.text(), "1");
                start();
            }, 120);
        });

        test("can override border color", function() {
            createTooltip({ border: { color: RED } });
            showNow(dataPointMock);
            equal(element.css("border-top-color").replace(/\s/g, ''), RED);
        });

        test("sets border color to current point color", function() {
            showNow(dataPointMock);
            equal(element.css("border-top-color").replace(/\s/g, ''), RED);
        });

        test("sets div background", function() {
            tooltip.options.background = BLUE;
            showNow(dataPointMock);
            equal(element.css("backgroundColor").replace(/\s/g, ''), BLUE);
        });

        test("sets text color", function() {
            createTooltip({ color: GREEN });
            showNow(dataPointMock);
            equal(element.css("color").replace(/\s/g, ''), GREEN);
        });

        test("applies full label format", function() {
            createTooltip({ format: "{0}%" });
            showNow(dataPointMock);
            equal(element.text(), "1%");
        });

        test("applies simple label format", function() {
            createTooltip({ format: "p0" });
            showNow(dataPointMock);
            equal(element.text(), "100 %");
        });

        test("renders template", function() {
            createTooltip({ template: "${value}%" });
            showNow(dataPointMock);
            equal(element.text(), "1%");
        });

        test("renders compiled template", function() {
            createTooltip({ template: kendo.template("${value}%") });
            showNow(dataPointMock);
            equal(element.text(), "1%");
        });

        test("renders template when format is set", function() {
            createTooltip({ format: "{0} percent", template: "${value}%" });
            showNow(dataPointMock);
            equal(element.text(), "1%");
        });

        test("template context has category", function() {
            createTooltip({ template: "${category}" });
            showNow(dataPointMock);
            equal(element.text(), "category");
        });

        test("template context has series", function() {
            createTooltip({ template: "${series.name}" });
            showNow(dataPointMock);
            equal(element.text(), "series");
        });

        test("template context has dataItem", function() {
            createTooltip({ template: "${dataItem.field}" });
            showNow(dataPointMock);
            equal(element.text(), "value");
        });

        test("positions tooltip on anchor", function() {
            tooltip.anchor = new dataviz.Point2D(10, 20);
            tooltip.options.animation.duration = 0;
            tooltip.options.offsetX = 0;
            tooltip.options.offsetY = 0;
            tooltip.move();

            deepEqual([parseInt(tooltip.element.css("left"), 10),
                  parseInt(tooltip.element.css("top"), 10)],
                  [10, 20]);
        });

        test("positions accounts for chart padding", function() {
            createTooltip();
            createPoint();

            chartElement.css({
                "padding-left": "10px",
                "padding-top": "20px"
            });

            tooltip.anchor = new dataviz.Point2D(10, 20);
            tooltip.options.animation.duration = 0;
            tooltip.move();

            deepEqual([parseInt(tooltip.element.css("left"), 10),
                  parseInt(tooltip.element.css("top"), 10)],
                  [20, 40]);
        });

        test("applies format from the series", function() {
            createPoint({ options: { tooltip: { format: "{0:C}" } }});
            showNow(dataPointMock);
            equal(element.text(), "$1.00");
        });

        // ------------------------------------------------------------
        module("Tooltip / currentPosition", {
            setup: function() {
                createTooltip();
                createPoint();
            },
            teardown: destroyTooltip
        });

        test("returns 0 if the tooltip fit in the window", function() {
            var result = tooltip._currentPosition(200, 100, 400);

            equal(result, 0);
        });

        test("if element does not fit right should be position left", function() {
            var result = tooltip._currentPosition(82, 42, 100);

            equal(result, -24);
        });

        test("if element does not fit right and does not fit left should be position right", function() {
            var result = tooltip._currentPosition(42, 42, 100);

            equal(result, 0);
        });

        // ------------------------------------------------------------
        module("Tooltip / _updateStyle", {
            setup: function() {
                createTooltip();
                createPoint();
            },
            teardown: destroyTooltip
        });

        test("removes inverse css class if backgorund is bright", function() {
            tooltip._updateStyle({ background: "#000" }, {});

            ok(!tooltip.element.hasClass("k-tooltip-inverse"));
        });

        test("sets inverse css class if backgorund is dark", function() {
            tooltip._updateStyle({ background: "#fff" }, {});

            ok(tooltip.element.hasClass("k-tooltip-inverse"));
        });

    })();


    (function() {
        var tooltip,
            element,
            chartElement,
            dataPointMock,
            RED = "rgb(255,0,0)";

        function createTooltip() {
            chartElement = $("<div id='chart'></div>").appendTo(QUnit.fixture);
            tooltip = new dataviz.Tooltip(chartElement, {
                background: "black",
                border: {
                    width: 5,
                    color: "red"
                },
                visible: false
            });

            element = tooltip.element;
            element.css({ width: "45px", height: "35px" });
        }

        function destroyTooltip() {
            chartElement.remove();
        }

        function showNow(point) {
            tooltip.show(point);
        }

        function createSeriesPoint(options) {
            dataPointMock = {
                value: 1,
                box: new dataviz.Box2D(0, 0, 10, 10),
                options: {
                    aboveAxis: true,
                    color: RED,
                    tooltip: {
                        border: {
                            color: "blue",
                            width: 2
                        },
                        visible: true,
                        color: "red",
                        background: "green",
                        opacity: 1
                    }
                },
                category: "category",
                dataItem: {
                    field: "value"
                },
                tooltipAnchor: function() {
                    return new dataviz.Point2D();
                },
                owner: {
                    formatPointValue: function(value, tooltipFormat) {
                        return kendo.format(tooltipFormat, value);
                    }
                },
                formatPointValue: function(format) {
                    var point = this;

                    return point.owner.formatPointValue(point.value, format);
                }
            };

            $.extend(dataPointMock, options);
        }

        // ------------------------------------------------------------
        module("Tooltip / Series", {
            setup: function() {
                createTooltip();
                createSeriesPoint();
            },
            teardown: destroyTooltip
        });

        test("sets border width", function() {
            showNow(dataPointMock);
            equal(element.css("border-top-width"), "2px");
        });

        test("sets opacity", function() {
            showNow(dataPointMock);
            equal(element.css("opacity"), 1);
        });
    })();

    (function() {
        var tooltip,
            chartElement,
            plotArea,
            point;

        function createPlotArea() {
            plotArea = {
                categoryAxis: {
                    pointCategoryIndex: function() {
                    },

                    getCategory: function() {
                    },

                    getSlot: function() {
                        return new dataviz.Box2D();
                    },

                    options: {
                        vertical: false
                    }
                }
            };
        }

        function createTooltip(options) {
            createPlotArea();
            createPoint();

            chartElement = $("<div id='chart'></div>").appendTo(QUnit.fixture);
            tooltip = new dataviz.SharedTooltip(chartElement, plotArea, options);
        }

        function destroyTooltip() {
            chartElement.remove();
        }

        function createPoint(options) {
            point = {
                value: 1,
                box: new dataviz.Box2D(0, 0, 10, 10),
                options: {
                    tooltip: {
                        template: "foo"
                    }
                },
                series: {
                    name: "series"
                },
                tooltipAnchor: function() {
                    return new dataviz.Point2D();
                }
            };

            $.extend(point, options);
        }

        function show() {
            tooltip.showAt([point], new dataviz.Point2D(0, 0));
        }

        // ------------------------------------------------------------
        module("Shared Tooltip", {
            setup: function() {
                createTooltip();
            }
        });

        test("shows shared tooltip", function() {
            show();
            ok(tooltip.element.html().indexOf("foo") !== -1);
        });

        test("shows series name in default template", function() {
            show();
            equal(tooltip.element.find("td").length, 2);
            ok(tooltip.element.html().indexOf("series") !== -1);
        });

        test("shows shared tooltip for series w/o name", function() {
            point.series.name = null;
            show();
            ok(tooltip.element.html().indexOf("foo") !== -1);
        });

        test("doesn't show empty series name in default template", function() {
            point.series.name = null;
            show();
            equal(tooltip.element.find("td").length, 1);
        });
    })();
})();
