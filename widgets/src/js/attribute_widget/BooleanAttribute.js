define([
    'jqueryui',
    'jsplumb',
    'lodash',
    'Util',
    'attribute_widget/AbstractAttribute',
    'attribute_widget/BooleanValue',
    'text!templates/attribute_widget/boolean_attribute.html'
],/** @lends BooleanAttribute */function($,jsPlumb,_,Util,AbstractAttribute,BooleanValue,booleanAttributeHtml) {

    BooleanAttribute.prototype = new AbstractAttribute();
	BooleanAttribute.prototype.constructor = BooleanAttribute;
    /**
     * BooleanAttribute
     * @class attribute_widget.BooleanAttribute
     * @memberof attribute_widget
     * @extends attribute_widget.AbstractAttribute
     * @constructor
     * @param {string} id Entity id
     * @param {string} name Name of attribute
     * @param {attribute_widget.AbstractEntity} subjectEntity Entity the attribute is assigned to
     * @param {Object} options Selection options as key value object
     */
    function BooleanAttribute(id,name,subjectEntity,options){
        AbstractAttribute.call(this,id,name,subjectEntity);

        /***
         * Value object of value
         * @type {attribute_widget.BooleanValue}
         * @private
         */
        var _value  = new BooleanValue(id,name,this,this.getRootSubjectEntity(),options);

        /**
         * jQuery object of DOM node representing the node
         * @type {jQuery}
         * @private
         */
        var _$node = $(_.template(booleanAttributeHtml)());

        /**
         * Set Value object of value
         * @param {attribute_widget.BooleanValue} value
         */
        this.setValue = function(value){
            _value = value;
        };

        /**
         * Get Value object of value
         * @return {attribute_widget.BooleanValue} value
         */
        this.getValue = function(){
            return _value;
        };

        /**
         * jQuery object of DOM node representing the attribute
         * @type {jQuery}
         * @private
         */
        this.get$node = function(){
            return _$node;
        };

        /**
         * Set attribute value by its JSON representation
         * @param {Object} json
         */
        this.setValueFromJSON = function(json){
            _value.setValueFromJSON(json.value);
        };

        _$node.find(".name").text(this.getName());
        _$node.find(".value").append(_value.get$node());

        // check if view only mode is enabled for the property browser
        // because then the input fields should be disabled
        if (window.hasOwnProperty("y")) {
            if(y.share.widgetConfig.get("view_only_property_browser")) {
                _$node.find(".val").attr("disabled", "true");
            }
        }
    }

    return BooleanAttribute;

});
