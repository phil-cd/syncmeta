define([
    'jqueryui',
    'jsplumb',
    'lodash',
    'attribute_widget/AbstractEntity',
    'text!templates/attribute_widget/abstract_attribute.html'
],/** @lends AbstractAttribute */function ($,jsPlumb,_,AbstractEntity,abstractAttributeHtml) {

    AbstractAttribute.prototype = new AbstractEntity();
    AbstractAttribute.prototype.constructor = AbstractAttribute;
    /**
     * Abstract Attribute
     * @class attribute_widget.AbstractAttribute
     * @memberof attribute_widget
     * @extends attribute_widget.AbstractEntity
     * @constructor
     * @param {string} id Entity id
     * @param {string} name Name of attribute
     * @param {AbstractEntity} subjectEntity Entity the attribute is assigned to
     */
    function AbstractAttribute(id,name,subjectEntity){

        AbstractEntity.call(this,id);

        /**
         * Name of Attribute
         * @type {string}
         * @private
         */
        var _name = name;

        /**
         * jQuery object of DOM node representing the attribute
         * @type {jQuery}
         * @private
         */
        var _$node = $(_.template(abstractAttributeHtml)());

        /**
         * Entity the attribute is assigned to
         * @type {attribute_widget.AbstractEntity}
         * @private
         */
        var _subjectEntity = subjectEntity;

        /**
         * Set name of the attribute
         * @param {string} name
         */
        this.setName = function(name){
            _name = name;
        };

        /**
         * Get name of the attribute
         * @returns {String}
         */
        this.getName = function(){
            return _name;
        };

        /**
         * Get entity the attribute is assigned to
         * @returns {attribute_widget.AbstractEntity}
         */
        this.getSubjectEntity = function(){
            return _subjectEntity;
        };

        /**
         * Get topmost entity in the chain of entities the attribute is assigned to
         * @returns {attribute_widget.AbstractEdge|attribute_widget.AbstractNode}
         */
        this.getRootSubjectEntity = function(){
            var rootSubjectEntity = this.getSubjectEntity();
            while(rootSubjectEntity instanceof AbstractAttribute){
                rootSubjectEntity = rootSubjectEntity.getSubjectEntity();
            }
            return rootSubjectEntity;
        };

        /**
         * Get id of the entity the attribute is assigned to
         * @returns {String}
         */
        this.getSubjectEntityId = function(){
            return _subjectEntity.getEntityId();
        };

        /**
         * Get jQuery object of the DOM node representing the attribute
         * @returns {jQuery}
         * @private
         */
        this._get$node = function(){
            return _$node;
        };
    }

    AbstractAttribute.prototype.get$node = function(){
        this._get$node();
    };

    return AbstractAttribute;

});