define([
    'jqueryui',
    'jsplumb',
    'lodash',
    'iwcw',
    'canvas_widget/AbstractValue',
    'canvas_widget/AbstractAttribute',
    'operations/ot/ValueChangeOperation',
    'operations/non_ot/ActivityOperation',
    'text!templates/canvas_widget/boolean_value.html',
    'text!templates/attribute_widget/boolean_value.html'
],/** @lends BooleanValue */function($,jsPlumb,_,IWCW,AbstractValue,AbstractAttribute,ValueChangeOperation,ActivityOperation,booleanValueHtml,attributeBooleanValueHtml) {

    BooleanValue.prototype = new AbstractValue();
    BooleanValue.prototype.constructor = BooleanValue;
    /**
     * BooleanValue
     * @class canvas_widget.BooleanValue
     * @extends canvas_widget.AbstractValue
     * @memberof canvas_widget
     * @constructor
     * @param {string} id Entity identifier
     * @param {string} name Name of attribute
     * @param {canvas_widget.AbstractEntity} subjectEntity Entity the attribute is assigned to
     * @param {canvas_widget.AbstractNode|canvas_widget.AbstractEdge} rootSubjectEntity Topmost entity in the chain of entity the attribute is assigned to
     */
    function BooleanValue(id,name,subjectEntity,rootSubjectEntity, useAttributeHtml){
        var that = this;
        if(useAttributeHtml)
            booleanValueHtml = attributeBooleanValueHtml;

        AbstractValue.call(this,id,name,subjectEntity,rootSubjectEntity);

        /**
         * Value
         * @type {boolean}
         * @private
         */
        var _value = false;

        /**
         * jQuery object of DOM node representing the node
         * @type {jQuery}
         * @private
         */
        var _$node = $(_.template(booleanValueHtml)({value: _value}));

        /**
         * Inter widget communication wrapper
         * @type {Object}
         * @private
         */
        var _iwcw = IWCW.getInstance(CONFIG.WIDGET.NAME.MAIN);

        /**
         * Get chain of entities the attribute is assigned to
         * @returns {string[]}
         */
        var getEntityIdChain = function(){
            var chain = [that.getEntityId()],
                entity = that;
            while(entity instanceof AbstractAttribute){
                chain.unshift(entity.getSubjectEntity().getEntityId());
                entity = entity.getSubjectEntity();
            }
            return chain;
        };

        /**
         * Apply a Value Change Operation
         * @param {operations.ot.ValueChangeOperation} operation
         */
        var processValueChangeOperation = function(operation){
            that.setValue(operation.getValue());
        };

        var init = function(){
            _$node.off();
        };        

        /**
         * Set value
         * @param {boolean} value
         */
        this.setValue = function(value){
            _value = value;
            if(useAttributeHtml)
                _$node.prop('checked',value);
            else
                _$node.text(value);
        };

        /**
         * Get value
         * @returns {boolean}
         */
        this.getValue = function(){
            return _value;
        };

        /**
         * Get jQuery object of DOM node representing the value
         * @returns {jQuery}
         */
        this.get$node = function(){
            return _$node;
        };

        /**
         * Get JSON representation of the edge
         * @returns {Object}
         */
        this.toJSON = function(){
            var json = AbstractValue.prototype.toJSON.call(this);
            json.value = _value;
            return json;
        };

        /**
         * Set value by its JSON representation
         * @param json
         */
        this.setValueFromJSON = function(json){
            this.setValue(json.value);
        };


        this.registerYType = function () {
            that.getRootSubjectEntity().getYMap().observePath([that.getEntityId()], function (event) {
                if (event) {
                    var operation = new ValueChangeOperation(event.entityId, event.value, event.type, event.position, event.jabberId);
                    _iwcw.sendLocalOTOperation(CONFIG.WIDGET.NAME.GUIDANCE, operation.getOTOperation());
                    processValueChangeOperation(operation);

                    //Only the local user Propagates the activity
                    if (_iwcw.getUser()[CONFIG.NS.PERSON.JABBERID] === operation.getJabberId()) {
                        y.share.activity.set(ActivityOperation.TYPE, new ActivityOperation(
                            "ValueChangeActivity",
                            that.getEntityId(),
                            _iwcw.getUser()[CONFIG.NS.PERSON.JABBERID],
                            ValueChangeOperation.getOperationDescription(that.getSubjectEntity().getName(), that.getRootSubjectEntity().getType(), that.getRootSubjectEntity().getLabel().getValue().getValue()),
                            {
                                value: operation.getValue(),
                                subjectEntityName: that.getSubjectEntity().getName(),
                                rootSubjectEntityType: that.getRootSubjectEntity().getType(),
                                rootSubjectEntityId: that.getRootSubjectEntity().getEntityId()
                            }
                        ));
                    } else {
                        //the remote users propagtes the change to their local attribute widget
                        //TODO(PENDING): can be replace with yjs as well
                        _iwcw.sendLocalOTOperation(CONFIG.WIDGET.NAME.ATTRIBUTE, operation.getOTOperation());
                    }
                }
            });

            //Debounce the save function
            that.getRootSubjectEntity().getYMap().observePath([that.getEntityId()], _.debounce(function (event) {
                if (event && event.jabberId === _iwcw.getUser()[CONFIG.NS.PERSON.JABBERID])
                    $('#save').click();
            }, 500));
        };

        init();
    }

    return BooleanValue;

});