<script src="<%= grunt.config('baseUrl') %>/js/debug_widget.js"></script>

<style>
    textarea, button {
        width: 100px;
    }
	 .seperating_box {
        border: 1px solid;
        border-radius: 7px; 
        margin: 18px 20px 7px 7px;
        padding: 7px 20px 7px 7px;
        position: relative;
    }
	.seperating_box > h5 {
        font-weight: normal;
        font-style: italic;
        position: absolute;
        top: -40px;
        left: 4px;
    }
	.hint {
		font-size: 10;
	}
</style>

<div class="seperating_box">
<h5> Select a JSON file </h5>
<input type="file" id="file-object" value="Load a file" />
</div>

<div id="modelDiv" class="seperating_box">
<h5> Import/Export/Delete a <strong>(Meta- or Guidance-)Model</strong> </h5>
<button id="import-model" title="Import a model to the canvas">Import</button>
<button id="export-model" title="export the model as JSON">Export</button>
<button id="delete-model" title="delete the model">Delete</button>
</div>

<div id="vlsDiv" class="seperating_box">
<h5> Import/Export/Delete a <strong>Metamodel</strong> (Model Editor only)</h5>
<button id="import-meta-model" title="Refresh the role space to apply the new VLS.">Import</button>
<button id="export-meta-model" title="Download the VLS as JSON">Export </button>
<button id="delete-meta-model" title="Refresh the role space and delete the current modeling language">Delete</button>
</div>

<div id="guidanceDiv" class="seperating_box">
<h5> Import/Export/Delete a <strong>Logical Guidancemodel</strong> (Model Editor only) </h5>
<button id="import-guidance-model">Import</button>
<button id="export-guidance-model">Export</button>
<button id="delete-guidance-model">Delete</button>
</div>

<div id="activityDiv" class="seperating_box">
<h5> Export/Delete a <strong>Activity list</strong> </h5>
<button id="export-activity-list">Export</button>
<button id="delete-activity-list">Delete</button>
</div>

<p class="hint">After import or delete refresh the canvas widget to apply the new model. After deleting and importing a new VLS refresh the whole role space.</p>
<p id="feedback"></p>