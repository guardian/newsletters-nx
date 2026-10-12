Feature: Reorder newsletters in an edition hub layout section
	As an editor
	I want to drag newsletters into a different order within a section
	So that they appear in that order when the layout is published

	Background:
		Given the editor is using the Stand workspace
		And the editor is editing the layout for edition "uk" with newsletters "Alpha", "Beta" and "Gamma" in section "News" and an unassigned newsletter "Delta"

	Scenario: Every newsletter has a drag handle
		Then each newsletter in section "News" has an enabled drag handle

	Scenario: Moving a newsletter down places it after the newsletter it is dropped below
		When the editor drags "Alpha" below "Beta" using the keyboard
		Then section "News" lists newsletters in the order "Beta", "Alpha", "Gamma"

	Scenario: Moving a newsletter to the bottom makes it the last item
		When the editor drags "Alpha" below "Gamma" using the keyboard
		Then section "News" lists newsletters in the order "Beta", "Gamma", "Alpha"

	Scenario: Moving a newsletter to the top makes it the first item
		When the editor drags "Gamma" above "Alpha" using the keyboard
		Then section "News" lists newsletters in the order "Gamma", "Alpha", "Beta"

	Scenario: Dropping a newsletter at the top of a section makes it the first item
		When the editor drags "Gamma" above "Alpha" using the mouse
		Then section "News" lists newsletters in the order "Gamma", "Alpha", "Beta"

	Scenario: Dropping a newsletter at the bottom of a section makes it the last item
		When the editor drags "Alpha" below "Gamma" using the mouse
		Then section "News" lists newsletters in the order "Beta", "Gamma", "Alpha"

	Scenario: Dropping a newsletter between two newsletters places it between them
		When the editor drags "Alpha" below "Beta" using the mouse
		Then section "News" lists newsletters in the order "Beta", "Alpha", "Gamma"

	Scenario: Dropping a newsletter outside the section leaves the order unchanged
		When the editor drags "Alpha" using the mouse and drops it outside the section
		Then section "News" lists newsletters in the order "Alpha", "Beta", "Gamma"

	Scenario: Cancelling a drag leaves the order unchanged
		When the editor starts dragging "Alpha" using the keyboard
		And the editor presses Escape
		Then section "News" lists newsletters in the order "Alpha", "Beta", "Gamma"

	Scenario: Dragging is disabled while the add newsletter area is open
		When the editor opens the add newsletter area for section "News"
		Then each newsletter in section "News" has a disabled drag handle

	Scenario: Reordering and publishing persists the change
		When the editor drags "Alpha" below "Beta" using the keyboard
		And the editor publishes the layout
		Then the layout for edition "uk" is saved with section "News" ordered "beta", "alpha", "gamma"
		And a success message is shown

	Scenario: Reordering and cancelling leaves stored data unchanged
		When the editor drags "Alpha" below "Beta" using the keyboard
		And the editor cancels editing the layout
		Then the editor is asked to confirm discarding their changes
		When the editor confirms discarding the changes
		Then the editor is returned to the read-only layout for edition "uk"
		And no reordered layout has been published

	Scenario: Keyboard users can Tab from a drag handle to the Remove button in the same row
		When the editor focuses the drag handle for "Alpha"
		And the editor presses Tab
		Then the Remove button for "Alpha" has focus
