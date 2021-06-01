define([
    'jqueryui',
    'jsplumb',
    'lodash',
    'Util',
    'canvas_widget/AbstractAttribute',
    'canvas_widget/FileValue',
    'text!templates/canvas_widget/file_attribute.html'
],/** @lends FileAttribute */function($,jsPlumb,_,Util,AbstractAttribute,FileValue,fileAttributeHtml) {

    FileAttribute.prototype = new AbstractAttribute();
    FileAttribute.prototype.constructor = FileAttribute;
    /**
     * FileAttribute
     * @class canvas_widget.FileAttribute
     * @extends canvas_widget.AbstractAttribute
     * @memberof canvas_widget
     * @constructor
     * @param {string} id Entity id
     * @param {string} name Name of attribute
     * @param {canvas_widget.AbstractEntity} subjectEntity Entity the attribute is assigned to
     */
    function FileAttribute(id,name,subjectEntity, useAttributeHtml){
        useAttributeHtml = typeof(useAttributeHtml) !== 'undefined' ? useAttributeHtml : false;
        AbstractAttribute.call(this,id,name,subjectEntity);

        /***
         * Value object of value
         * @type {canvas_widget.FileValue}
         * @private
         */
        var _value = new FileValue(id,name,this,this.getRootSubjectEntity(), useAttributeHtml);

        /**
         * jQuery object of DOM node representing the node
         * @type {jQuery}
         * @private
         */
        var _$node = $(_.template(fileAttributeHtml)());

        /**
         * Set Value object of value
         * @param {canvas_widget.FileValue} value
         */
        this.setValue = function(value){
            _value = value;
            _$node.val(value);
        };

        /**
         * Get Value object of value
         * @return {canvas_widget.FileValue} value
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
         * Get JSON representation of the attribute
         * @returns {Object}
         */
        this.toJSON = function(){
            var json = AbstractAttribute.prototype.toJSON.call(this);
            json.value = _value.toJSON();
            return json;
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
    }

    return FileAttribute;

});