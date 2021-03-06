define([
    'jqueryui',
    'lodash',
    'activity_widget/Activity',
    'activity_widget/NodeAddActivity',
    'activity_widget/NodeDeleteActivity',
    'activity_widget/NodeMoveActivity',
    'activity_widget/NodeResizeActivity',
    'activity_widget/EdgeAddActivity',
    'activity_widget/EdgeDeleteActivity',
    'activity_widget/EditorGenerateActivity',
    'activity_widget/UserJoinActivity',
    'activity_widget/ValueChangeActivity',
    'activity_widget/ViewApplyActivity',
    'activity_widget/ReloadWidgetActivity',
    'activity_widget/User',
    'operations/non_ot/ActivityOperation',
    'operations/non_ot/EntitySelectOperation'
],/** @lends ActivityList */function ($, _, Activity, NodeAddActivity, NodeDeleteActivity, NodeMoveActivity, NodeResizeActivity, EdgeAddActivity, EdgeDeleteActivity, EditorGenerateActivity, UserJoinActivity, ValueChangeActivity, ViewApplyActivity, ReloadWidgetActivity, User, ActivityOperation, EntitySelectOperation) {

    /**
     * List of user activities
     * @class activity_widget.ActivityList
     * @memberof activity_widget
     * @constructor
     * @param {jQuery} $userListNode jquery object of DOM node representing the user list
     * @param {jQuery} $activityListNode jquery object of DOM node representing the activity list
     */
    function ActivityList($userListNode, $activityListNode) {
        var that = this;

        /**
         * jQuery object of DOM node representing the user list
         * @type {jQuery}
         * @private
         */
        var _$userListNode = $userListNode;

        /**
         * jQuery object of DOM node representing the activity list
         * @type {jQuery}
         * @private
         */
        var _$activityListNode = $activityListNode;

        /**
         * List of user
         * @type {object}
         */
        var userList = {};

        /**
         * List of activities
         * @type {Array}
         */
        var activityList = [];

        /**
         * Add an user to the user list
         * @param {string} jabberId
         */
        this.addUser = function (jabberId) {
            var user;
            if (!userList.hasOwnProperty(jabberId)) {
                user = new User(jabberId, new Date());
                userList[jabberId] = user;
                _$userListNode.append(user.get$node().show("clip", {}, 200));
            } else {
                user = userList[jabberId];
                user.setLastActivityDate(new Date());
                user.show();
            }
        };

        /**
         * Get user by jabber Id
         * @param {string} jabberId
         * @returns {activity_widget.User}
         */
        this.getUser = function (jabberId) {
            if (userList.hasOwnProperty(jabberId)) {
                return userList[jabberId];
            }
            return null;
        };

        //noinspection JSUnusedGlobalSymbols
        /**
         * Remove User by jabber Id
         * @param {string} jabberId
         */
        this.removeUser = function (jabberId) {
            var user;
            if (userList.hasOwnProperty(jabberId)) {
                user = userList[jabberId];
                user.setLastActivityDate(new Date());
                user.hide();
            }
        };

        /**
         * Add an activity to the activity list
         * @param {activity_widget/Activity} activity
         */
        this.addActivity = function (activity) {
            activityList.unshift(activity);
            _$activityListNode.prepend(activity.get$node().show("clip", {}, 200));
        };

        this.addActivityToLog = function (activity, data) {
            //add activity to yjs log, also start the log if not already 
            var jsonActivityList = y.share.activity.get('log');
            if (!jsonActivityList)
                y.share.activity.set('log', that.toJSON());
            else {
                /*if (activity instanceof ValueChangeActivity && jsonActivityList.length > 0) {
                    var first = jsonActivityList[0];
                    if (first.type === ValueChangeActivity.TYPE)
                        first.text = activity.getText();
                }
                else{*/
                var json = activity.toJSON();
                if (data)
                    json.data = data;
                jsonActivityList.unshift(json);
                //}
                y.share.activity.set('log', jsonActivityList);
            }
        }

        /**
         * Get first activity from the list
         * @returns {Activity}
         */
        this.getFirst = function () {
            if (activityList.length > 0) {
                return activityList[0];
            }
            return null;
        };

        /**
         * Activity List to JSON
         */
        this.toJSON = function () {
            var list = [];
            _.forEach(activityList, function (activity) {
                list.unshift(activity.toJSON());
            });
            return list;
        }

        /**
         * Callback for received Operations
         * @param {operations.non_ot.ActivityOperation|operations.non_ot.EntitySelectOperation} operation
         */
        var operationCallback = function (operation) {
            var activity,
                user,
                firstActivity,
                data;

            if (operation instanceof ActivityOperation) {
                data = operation.getData();
                switch (operation.getType()) {
                    case NodeAddActivity.TYPE:
                        activity = new NodeAddActivity(operation.getEntityId(), operation.getSender(), operation.getText(), Date.now(), data.nodeType);
                        that.addActivity(activity);

                        that.findTrackableActivities(activity);
                        break;
                    case EdgeAddActivity.TYPE:
                        activity = new EdgeAddActivity(operation.getEntityId(), operation.getSender(), operation.getText(), Date.now(), data.nodeType, data.sourceNodeLabel, data.sourceNodeId, data.sourceNodeType, data.targetNodeLabel, data.targetNodeId, data.targetNodeType);
                        that.findTrackableActivities(activity);
                        that.addActivity(activity);

                        that.findTrackableActivities(activity);
                        break;
                    case NodeDeleteActivity.TYPE:
                        activity = new NodeDeleteActivity(operation.getEntityId(), operation.getSender(), operation.getText(), Date.now());
                        that.addActivity(activity);

                        that.findUntrackableActivities(activity);
                        break;
                    case EdgeDeleteActivity.TYPE:
                        activity = new EdgeDeleteActivity(operation.getEntityId(), operation.getSender(), operation.getText(), Date.now());
                        that.addActivity(activity);

                        that.findUntrackableActivities(activity);
                        break;
                    case NodeMoveActivity.TYPE:
                        activity = new NodeMoveActivity(operation.getEntityId(), operation.getSender(), operation.getText(), Date.now(), data.nodeType);
                        that.addActivity(activity);

                        activity.trackable();
                        break;
                    case NodeResizeActivity.TYPE:
                        activity = new NodeResizeActivity(operation.getEntityId(), operation.getSender(), operation.getText(), Date.now(), data.nodeType);
                        that.addActivity(activity);

                        activity.trackable();
                        break;
                    case ValueChangeActivity.TYPE:
                        activity = new ValueChangeActivity(operation.getEntityId(), operation.getSender(), operation.getText(), Date.now(), data.value, data.subjectEntityName, data.rootSubjectEntityType, data.rootSubjectEntityId);
                        firstActivity = that.getFirst();
                        if (firstActivity && firstActivity instanceof ValueChangeActivity && firstActivity.getEntityId() === activity.getEntityId() && firstActivity.getSender() === activity.getSender()) {
                            firstActivity.setText(activity.getText());
                        } else {
                            that.addActivity(activity);
                        }

                        activity.trackable();
                        break;
                    case EditorGenerateActivity.TYPE:
                        activity = new EditorGenerateActivity(operation.getEntityId(), operation.getSender(), operation.getText(), Date.now());
                        that.addActivity(activity);
                        break;
                    case UserJoinActivity.TYPE:
                        that.addUser(operation.getSender());
                        break;
                    case 'UserLeftActivity': {
                        activity = new Activity(null, operation.getSender(), '.. left the space', Date.now());
                        activity.setType('UserLeftActivity');
                        that.addActivity(activity);
                        that.removeUser(operation.getSender());
                        break;
                    }
                    case 'ApplyLayoutActivity': {
                        activity = new Activity(null, operation.getSender(), operation.getText(), Date.now());
                        activity.setType('ApplyLayoutActivity');
                        that.addActivity(activity);
                        break;
                    }
                    case 'ReloadWidgetOperation':
                        activity = new ReloadWidgetActivity(operation.getEntityId(), operation.getSender(), operation.getText(), Date.now());
                        activity.setType('ReloadWidgetOperation');
                        that.addActivity(activity);
                        break;
                    case ViewApplyActivity.TYPE:
                        activity = new ViewApplyActivity(operation.getEntityId(), operation.getSender());
                        if (userList.hasOwnProperty(activity.getSender())) {
                            userList[activity.getSender()].get$node().find('.lblViewId').text(activity.getViewId());
                        }
                        break;
                    case 'WidgetTrackingActivity':
                        activity = new Activity(operation.getEntityId(), operation.getSender(), operation.getText(), Date.now());
                        activity.setType(operation.getType());
                        //Don't add this to the activity widget
                        break;
                    default: {
                        activity = new Activity(operation.getEntityId(), operation.getSender(), operation.getText(), Date.now());
                        activity.setType(operation.getType());
                        that.addActivity(activity);
                        break;
                    }
                }
                user = that.getUser(operation.getSender());
                if (user) {
                    user.setLastActivityDate(new Date());
                    if(y.share.users.get(y.db.userId) === operation.getSender())
                        that.addActivityToLog(activity, data);
                }
                return;
            }
        };

        this.findUntrackableActivities = function (activity) {
            for (var i = 0; i < activityList.length; i++) {
                var a = activityList[i];
                if (a.isTrackable && (activity.getEntityId() === a.getEntityId() || a instanceof NodeDeleteActivity || a instanceof EdgeAddActivity)) {
                    a.untrackable();
                }
            }
        }

        this.findTrackableActivities = function (activity) {
            for (var i = 0; i < activityList.length; i++) {
                var a = activityList[i];
                if (!a.isTrackable() && activity.getEntityId() === a.getEntityId() && !(a instanceof NodeDeleteActivity || a instanceof EdgeDeleteActivity)) {
                    a.trackable();
                }
            }
        }

        this.init = function () {
            //initialize the activity list with activities of previous session
            var list = y.share.activity.get('log');
            var activity;
            var checkEntity = function (entityId) {
                if (y.share.nodes.keys().indexOf(entityId) != -1 || y.share.edges.keys().indexOf(entityId) != -1)
                    return true;
                else return false;
            }
            if (list) {
                _.forEachRight(list, function (a) {
                    switch (a.type) {
                        case NodeAddActivity.TYPE: {
                            activity = new NodeAddActivity(a.entityId, a.sender, a.text, a.timestamp, a.nodeType);
                            that.addActivity(activity);
                            break;
                        }
                        case NodeDeleteActivity.TYPE: {
                            activity = new NodeDeleteActivity(a.entityId, a.sender, a.text, a.timestamp);
                            that.addActivity(activity);
                            break;
                        }
                        case EdgeAddActivity.TYPE: {
                            activity = new EdgeAddActivity(a.entityId, a.sender, a.text, a.timestamp, a.nodeType, a.sourceNodeLabel, a.sourceNodeId, a.sourceNodeType, a.targetNodeLabel, a.targetNodeId, a.targetNodeType);
                            that.addActivity(activity);
                            break;
                        }
                        case EdgeDeleteActivity.TYPE: {
                            activity = new EdgeDeleteActivity(a.entityId, a.sender, a.text, a.timestamp);
                            that.addActivity(activity);
                            break;
                        }
                        case NodeMoveActivity.TYPE: {
                            activity = new NodeMoveActivity(a.entityId, a.sender, a.text, a.timestamp, a.nodeType);
                            that.addActivity(activity);
                            break;
                        }
                        case NodeResizeActivity.TYPE: {
                            activity = new NodeResizeActivity(a.entityId, a.sender, a.text, a.timestamp, a.nodeType);
                            that.addActivity(activity);
                            if (y.share.nodes.keys().indexOf())
                                break;
                        }
                        case ValueChangeActivity.TYPE: {
                            activity = new ValueChangeActivity(a.entityId, a.sender, a.text, a.timestamp, a.value, a.subjectEntityName, a.rootSubjectEntityType, a.rootSubjectEntityId);
                            that.addActivity(activity);
                            break;
                        }
                        case EditorGenerateActivity.TYPE: {
                            activity = new EditorGenerateActivity(a.entityId, a.sender, a.text, a.timestamp);
                            that.addActivity(activity);
                            break;
                        }
                        default: {
                            activity = new Activity(a.entityId, a.sender, a.text, a.timestamp)
                            that.addActivity(activity);
                            break;
                        }
                    }
                    if (checkEntity(activity.getEntityId()))
                        activity.trackable();
                    else activity.untrackable();
                });
            }
        }
        if (y) {
            y.share.activity.observe(function (event) {
                if (event.name === 'log' || event.value.sender == null) return;
                operationCallback(new ActivityOperation(event.value.type, event.value.entityId, event.value.sender, event.value.text, event.value.data));
            });

            y.share.select.observe(function (event) {
                if (event.value === null) {
                    _.each(activityList, function (activity) {
                        activity.show();
                    });
                } else {
                    _.each(activityList, function (activity) {
                        activity.show();
                    });
                    _.each(_.filter(activityList, function (activity) {
                        if (activity instanceof ValueChangeActivity) {
                            return activity.getRootSubjectEntityId() !== event.value;
                        }
                        return activity.getEntityId() !== event.value;
                    }), function (activity) {
                        activity.hide();
                    });
                }

            });
        }
    }

    return ActivityList;

});
