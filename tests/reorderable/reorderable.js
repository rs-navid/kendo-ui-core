(function() {
    var Reorderable = kendo.ui.Reorderable,
        div;

    module("kendo.ui.Reorderable", {
        setup: function() {
            div= $("<div><div>1</div><div>2</div><div>3</div></div>")
                .find("div")
                .css({float: "left"})
                .end().prependTo(QUnit.fixture);
        },
        teardown: function() {
            kendo.destroy(QUnit.fixture);
            div.remove();
        }
    });

    function ev(options) {
        return $.extend(new $.Event, options);
    }

    function moveOverDropTarget(draggable, dropTarget) {
        var position = dropTarget.offset();

        draggable.trigger({ type: "mousedown", pageX: 1, pageY: 1 });

        $(QUnit.fixture).trigger({
            type: "mousemove",
            pageX: position.left,
            pageY: position.top,
            clientX: position.left,
            clientY: position.top
        });

        $(QUnit.fixture).trigger({
            type: "mouseup",
            pageX: position.left,
            pageY: position.top,
            clientX: position.left,
            clientY: position.top
        });
    }

    function equalPositions(source, target, before) {
        var position = target.offset().left + (before ? 0 : target.outerWidth());

        equal(parseInt(source.css("left"), 10), position);
    }

    test("widget name option is Reorderable", function() {
        equal(Reorderable.fn.options.name, "Reorderable");
    });

    test("Reorderable instance from element created from constructor", function() {
        var reorderable = new Reorderable(div, {});

        ok(div.data("kendoReorderable") instanceof Reorderable);
    });

    test("Reorderable instance from element created from jQuery extension", function() {
        div.kendoReorderable();

        ok(div.data("kendoReorderable") instanceof Reorderable);
    });

    test("adds class k-reorderable to element", function() {
        div.kendoReorderable();

        ok(div.hasClass("k-reorderable"));
    });

    test("element initialized as Draggable", function() {
        div.kendoReorderable();

        ok(div.data("kendoDraggable") instanceof kendo.ui.Draggable);
    });

    test("element initializes DropTargets", function() {
        div.kendoReorderable();

        var elements = div.children();

        ok(elements.eq(0).data("kendoDropTarget") instanceof kendo.ui.DropTarget);
        ok(elements.eq(1).data("kendoDropTarget") instanceof kendo.ui.DropTarget);
        ok(elements.eq(2).data("kendoDropTarget") instanceof kendo.ui.DropTarget);
    });

    test("reorder cue after drop target", function() {
        var reorderable = new Reorderable(div, {}),
        target = div.children().eq(1);

        moveOverDropTarget(div.children().eq(0), target);

        equalPositions(reorderable.reorderDropCue, target);
    });

    test("reorder cue doesn't show on same target", function() {
        var reorderable = new Reorderable(div, {}),
        target = div.children().eq(1);

        moveOverDropTarget(target, target);

        ok(!reorderable.reorderDropCue.is(":visible"));
    });

    test("reorder cue before first drop target", function() {
        var reorderable = new Reorderable(div, {}),
        target = div.children().eq(0);

        moveOverDropTarget(div.children().eq(1), target);

        equalPositions(reorderable.reorderDropCue, target, true);
    });

    test("reorder cue height is same as target height", function() {
        var reorderable = new Reorderable(div, {}),
        target = div.children().eq(1);

        moveOverDropTarget(div.children().eq(0), target);

        equal(reorderable.reorderDropCue.outerHeight(), target.outerHeight());
    });

    test("reorder cue is removed on drop", function() {
        var reorderable = new Reorderable(div, {}),
        source = div.children().eq(0),
        target = div.children().eq(1);

        moveOverDropTarget(source, target);

        ok(!reorderable.reorderDropCue.is(":visible"));
        equal($(".k-reorder-cue", QUnit.fixture).length, 0);
    });

    test("change event is triggered", function() {
        var called = false,
        reorderable = new Reorderable(div, {
            change: function() {
                called = true;
            }
        }),
        source = div.children().eq(0),
        target = div.children().eq(1);

        moveOverDropTarget(source, target);

        ok(called);
    });

    test("change event is not triggered when drop on same target", function() {
        var called = false,
        reorderable = new Reorderable(div, {
            change: function() {
                called = true;
            }
        }),
        target = div.children().eq(1);

        moveOverDropTarget(target, target);

        ok(!called);
    });

    test("change event arguments", function() {
        div.children().eq(0).addClass("disabled");
        var args,
        reorderable = new Reorderable(div, {
            change: function() {
                args = arguments[0];
            },
            filter: "div:not(.disabled)"
        }),
        source = div.children().eq(1),
        target = div.children().eq(2);

        moveOverDropTarget(source, target);

        equal(args.element[0], source[0]);
        equal(args.oldIndex, 0);
        equal(args.newIndex, 1);
    });
})();
