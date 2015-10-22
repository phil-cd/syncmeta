define(['Util','guidance_widget/GuidanceStrategy', 'guidance_widget/ActivityStatus'
],function(Util,GuidanceStrategy, ActivityStatus) {

    var SingleUserGuidanceStrategy = GuidanceStrategy.extend({
        init: function(logicalGuidanceDefinition, space){
            this._super(logicalGuidanceDefinition, space);
            this.initialNodes = this.logicalGuidanceDefinition.sources();
            this.nodeMappings = {};
            this.activityStatusList = {};
            this.lastCreatedObjectId = "";
            this.currentActivity = null;

            for(var i = 0; i < this.initialNodes.length; i++){
                var nodeId = this.initialNodes[i];
                this.activityStatusList[Util.generateRandomId()] = new ActivityStatus(this.logicalGuidanceDefinition, nodeId);
            }
        },
        onEntitySelect: function(entityId, entityType){
        },
        onUserJoin: function(user){
        },
        onGuidanceFollowed: function(user, objectId, rule){
            // if(user == this.space.user[CONFIG.NS.PERSON.JABBERID]){
            //     console.log("Self follow");
            // }
            // else{
            //     this.avoidObjects[objectId] = {};
            //     var that = this;
            //     setTimeout(function(){
            //         console.log("Timeout!");
            //         if(that.avoidObjects.hasOwnProperty(objectId))
            //             delete that.avoidObjects[objectId]
            //     },10000);
            // }
        },
        checkNodeAddForActivity: function(id, type, activityStatus){
            var activityExpectedNodes = activityStatus.getExpectedNodes();
            for(var i = 0; i < activityExpectedNodes.length; i++){
                var nodeId = activityExpectedNodes[i];
                var node = this.logicalGuidanceDefinition.node(nodeId);
                if(node.type == "CREATE_OBJECT_ACTION" && node.objectType == type){
                    return nodeId;
                }
            }
            return null;
        },
        checkEdgeAddForActivity: function(id, type, activityStatus){
            var activityExpectedNodes = activityStatus.getExpectedNodes();
            for(var i = 0; i < activityExpectedNodes.length; i++){
                var nodeId = activityExpectedNodes[i];
                var node = this.logicalGuidanceDefinition.node(nodeId);
                if(node.type == "CREATE_RELATIONSHIP_ACTION" && node.relationshipType == type){
                    return nodeId;
                }
            }
            return null;
        },
        onNodeAdd: function(id, type){
            this.lastCreatedObjectId = id;
            var nextNode = null;
            //Check if we can proceed in the current activity
            if(this.currentActivity){
                nextNode = this.checkNodeAddForActivity(id, type, this.currentActivity);
            }
            //If we could not proceed check if we can start a new activity
            if(!nextNode){
                this.currentActivity = null;
                for(var i = 0; i < this.initialNodes.length; i++){
                    var nodeId = this.initialNodes[i];
                    var newActivity = new ActivityStatus(this.logicalGuidanceDefinition, nodeId);
                    nextNode = this.checkNodeAddForActivity(id, type, newActivity);
                    if(nextNode){
                        this.currentActivity = newActivity;
                        break;
                    }
                }
            }
            if(this.currentActivity){
                var node = this.logicalGuidanceDefinition.node(nextNode);
                this.currentActivity.setNodeMapping(node.createdObjectId, id);
                this.currentActivity.proceed(nextNode);
            }
            this.showExpectedActions(id);
        },
        onNodeDelete: function(id, type){
            this.showGuidanceBox("", []);
        },
        onEdgeAdd: function(id, type){
            var nextNode = null;
            if(this.currentActivity){
                nextNode = this.checkEdgeAddForActivity(id, type, this.currentActivity)
            }
            if(nextNode)
                this.currentActivity.proceed(nextNode);
            else
                this.currentActivity = null;
            
            this.showExpectedActions(this.lastCreatedObjectId);
        },
        showExpectedActions: function(entityId){
            var guidanceItems = [];
            var activityName = "";

            if(this.currentActivity){
                activityName = this.currentActivity.getName();
                var activityExpectedNodes = this.currentActivity.getExpectedNodes();
                for(var i = 0; i < activityExpectedNodes.length; i++){
                    var nodeId = activityExpectedNodes[i];
                    var node = this.logicalGuidanceDefinition.node(nodeId);
                    switch(node.type){
                        case "SET_PROPERTY_ACTION":
                        guidanceItems.push(this.createSetPropertyGuidanceItem("", node));
                        break;
                        case "CREATE_OBJECT_ACTION":
                        guidanceItems.push(this.createSelectToolGuidanceItem("", node));
                        break;
                        case "CREATE_RELATIONSHIP_ACTION":
                        guidanceItems.push(this.createGhostEdgeGuidanceItem("", node));
                        break;
                        case "ACTIVITY_FINAL_NODE":
                        break;
                    }
                }
            }
            this.showGuidanceBox(activityName, guidanceItems, entityId);
        },
        createSetPropertyGuidanceItem: function(id, action){
            var guidanceItem = {
                "id": id,
                "type": "SET_PROPERTY_GUIDANCE",
                "label": "Set " + action.propertyName + " property",
                "entityId": this.currentActivity.getNodeMapping(action.sourceObjectId),
                "propertyName": action.propertyName
            };
            return guidanceItem;
        },
        createSelectToolGuidanceItem: function(id, action){
            var guidanceItem = {
                "id": id,
                "type": "SELECT_TOOL_GUIDANCE",
                "label": action.objectType,
                "tool": action.objectType
            };
            return guidanceItem;
        },
        createGhostEdgeGuidanceItem: function(id, action){
            var guidanceItem = {
                "id": id,
                "type": "GHOST_EDGE_GUIDANCE",
                "sourceId": this.currentActivity.getNodeMapping(action.sourceObjectId),
                "targetId": this.currentActivity.getNodeMapping(action.targetObjectId),
                "relationshipType": action.relationshipType
            };
            return guidanceItem;
        }
    });

    SingleUserGuidanceStrategy.NAME = "Single User Guidance Strategy";
    SingleUserGuidanceStrategy.ICON = "user";

    return SingleUserGuidanceStrategy;

});
