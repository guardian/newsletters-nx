Feature: Reorder newsletters in an edition hub layout section
	As an editor
	I want to drag newsletters into a different order within a section
	So that they appear in that order when the layout is published

	Background:
		Given the editor is using the Stand workspace

	# These scenarios stub the API so they can focus on the editor's behaviour.
	Rule: A newsletter can be moved with the keyboard or the mouse

		Background:
			Given the editor is editing the "uk" layout with section "News" listing "Alpha, Beta, Gamma"

		Scenario Outline: Moving "<newsletter>" <position> "<target>" using the <input>
			When the editor moves "<newsletter>" <position> "<target>" using the <input>
			Then section "News" lists "<order>"

			Examples:
				| input    | newsletter | position | target | order              |
				| keyboard | Alpha      | below    | Beta   | Beta, Alpha, Gamma |
				| keyboard | Alpha      | below    | Gamma  | Beta, Gamma, Alpha |
				| keyboard | Gamma      | above    | Alpha  | Gamma, Alpha, Beta |
				| mouse    | Alpha      | below    | Beta   | Beta, Alpha, Gamma |
				| mouse    | Alpha      | below    | Gamma  | Beta, Gamma, Alpha |
				| mouse    | Gamma      | above    | Alpha  | Gamma, Alpha, Beta |

		Scenario: Dropping a newsletter outside the section leaves the order unchanged
			When the editor drops "Alpha" outside the section using the mouse
			Then section "News" lists "Alpha, Beta, Gamma"

		Scenario: Cancelling a keyboard move leaves the order unchanged
			When the editor cancels a keyboard move of "Alpha"
			Then section "News" lists "Alpha, Beta, Gamma"

		Scenario: Every newsletter has a drag handle
			Then each newsletter in section "News" has an enabled drag handle

		Scenario: Tabbing from a drag handle reaches the Remove button in the same row
			When the editor tabs forward from the drag handle for "Alpha"
			Then the Remove button for "Alpha" has focus

	# These scenarios use the real API and storage.
	Rule: A new order is only saved when the layout is published

		Background:
			Given the "uk" layout has section "News" listing stored newsletters "Alpha, Beta, Gamma"
			And the editor opens the "uk" layout for editing
			And the editor moves "Alpha" below "Beta" using the keyboard

		Scenario: Publishing saves the new order
			When the editor publishes the layout
			Then a success message is shown
			When the editor opens the "uk" layout for editing
			Then section "News" lists "Beta, Alpha, Gamma"

		Scenario: Discarding changes keeps the published order
			When the editor cancels editing the layout
			And the editor confirms discarding the changes
			Then the editor is returned to the read-only layout for edition "uk"
			When the editor opens the "uk" layout for editing
			Then section "News" lists "Alpha, Beta, Gamma"
