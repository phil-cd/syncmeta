define([
    'jqueryui',
    'jsplumb',
    'lodash',
    'canvas_widget/AbstractNode',
    'canvas_widget/SingleSelectionAttribute',
    'canvas_widget/SingleValueAttribute',
    'canvas_widget/IntegerAttribute',
    'canvas_widget/SingleColorValueAttribute',
    'canvas_widget/SingleMultiLineValueAttribute',
    'text!templates/canvas_widget/node_shape_node.html'
],/** @lends NodeShapeNode */function($, jsPlumb, _, AbstractNode, SingleSelectionAttribute, SingleValueAttribute, IntegerAttribute, SingleColorValueAttribute, SingleMultiLineValueAttribute, nodeShapeNodeHtml) {

    NodeShapeNode.TYPE = "Node Shape";
    NodeShapeNode.DEFAULT_WIDTH = 150;
    NodeShapeNode.DEFAULT_HEIGHT = 150;

    NodeShapeNode.prototype = new AbstractNode();
    NodeShapeNode.prototype.constructor = NodeShapeNode;
    /**
     * Abstract Class Node
     * @class canvas_widget.NodeShapeNode
     * @extends canvas_widget.AbstractNode
     * @memberof canvas_widget
     * @constructor
     * @param {string} id Entity identifier of node
     * @param {number} left x-coordinate of node position
     * @param {number} top y-coordinate of node position
     * @param {number} width Width of node
     * @param {number} height Height of node
     * @param {number} zIndex Position of node on z-axis
     */
    function NodeShapeNode(id, left, top, width, height, zIndex, json) {
        var that = this;

        AbstractNode.call(this, id, NodeShapeNode.TYPE, left, top, width, height, zIndex, json);

        /**
         * jQuery object of node template
         * @type {jQuery}
         * @private
         */
        var _$template = $(_.template(nodeShapeNodeHtml)({ type: that.getType() }));

        /**
         * jQuery object of DOM node representing the node
         * @type {jQuery}
         * @private
         */
        var _$node = AbstractNode.prototype.get$node.call(this).append(_$template).addClass("class");

        /**
         * jQuery object of DOM node representing the attributes
         * @type {jQuery}
         * @private
         */
        var _$attributeNode = _$node.find(".attributes");

        /**
         * Attributes of node
         * @type {Object}
         * @private
         */
        var _attributes = this.getAttributes();

        /**
         * Get JSON representation of the node
         * @returns {Object}
         */
        this.toJSON = function() {
            var json = AbstractNode.prototype.toJSON.call(this);
            json.type = NodeShapeNode.TYPE;
            return json;
        };

        var attrShapeSelect = new SingleSelectionAttribute(this.getEntityId() + "[shape]", "Shape", this, { "circle": "Circle", "diamond": "Diamond", "rectangle": "Rectangle", "rounded_rectangle": "Rounded Rectangle", "triangle": "Triangle" });
        var attrWidth = new IntegerAttribute(this.getEntityId() + "[defaultWidth]", "Default Width", this);
        var attrHeight = new IntegerAttribute(this.getEntityId() + "[defaultHeight]", "Default Height", this);
        var attrColor = new SingleColorValueAttribute(this.getEntityId() + "[color]", "Color", this);
        var attrCustomShape = new SingleMultiLineValueAttribute(this.getEntityId() + "[customShape]", "Custom Shape", this);
        var attrAnchors = new SingleValueAttribute(this.getEntityId() + "[customAnchors]", "Custom Anchors", this);



        this.addAttribute(attrShapeSelect);
        this.addAttribute(attrColor);
        this.addAttribute(attrWidth);
        this.addAttribute(attrHeight);
        this.addAttribute(attrCustomShape);
        this.addAttribute(attrAnchors);

        _$node.find(".label").append(this.getLabel().get$node());

        for (var attributeKey in _attributes) {
            if (_attributes.hasOwnProperty(attributeKey)) {
                _$attributeNode.append(_attributes[attributeKey].get$node());
            }
        }

        this.registerYMap = function() {
            AbstractNode.prototype.registerYMap.call(this);
            attrShapeSelect.getValue().registerYType();
            attrWidth.getValue().registerYType();
            attrHeight.getValue().registerYType();
            that.getLabel().getValue().registerYType();
            attrColor.getValue().registerYType();
            attrAnchors.getValue().registerYType();
            attrCustomShape.getValue().registerYType();
        };
    }

    return NodeShapeNode;

});