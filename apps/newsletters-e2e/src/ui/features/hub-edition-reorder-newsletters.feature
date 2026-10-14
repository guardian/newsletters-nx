Feature: Reorder newsletters in an edition hub layout section
	As an editor
	I want to drag newsletters into a different order within a section
	So that they appear in that order when the layout is published

	Background:
		Given the editor is using the Stand workspace
		And the editor is editing the "uk" layout with section "News" listing "Alpha, Beta, Gamma"

	Rule: A newsletter is placed where the editor drops it

		Scenario Outline: Moving "<newsletter>" <position> "<target>" using the <input>
			When the editor moves "<newsletter>" <position> "<target>" using the <input>
			Then section "News" lists "<order>"

			Examples: Keyboard
				| input    | newsletter | position | target | order              |
				| keyboard | Alpha      | below    | Beta   | Beta, Alpha, Gamma |
				| keyboard | Alpha      | below    | Gamma  | Beta, Gamma, Alpha |
				| keyboard | Gamma      | above    | Alpha  | Gamma, Alpha, Beta |

			Examples: Mouse
				| input | newsletter | position | target | order              |
				| mouse | Alpha      | below    | Beta   | Beta, Alpha, Gamma |
				| mouse | Alpha      | below    | Gamma  | Beta, Gamma, Alpha |
				| mouse | Gamma      | above    | Alpha  | Gamma, Alpha, Beta |

	Rule: An abandoned move leaves the order unchanged

		Scenario: Dropping a newsletter outside the section
			When the editor drops "Alpha" outside the section using the mouse
			Then section "News" lists "Alpha, Beta, Gamma"

		Scenario: Cancelling a keyboard move
			When the editor cancels a keyboard move of "Alpha"
			Then section "News" lists "Alpha, Beta, Gamma"

	Rule: A new order is only saved when the layout is published

		Scenario: Publishing saves the new order
			Given the editor has moved "Alpha" below "Beta"
			When the editor publishes the layout
			Then the published layout lists section "News" as "Beta, Alpha, Gamma"
			And a success message is shown

		Scenario: Discarding changes keeps the published order
			Given the editor has moved "Alpha" below "Beta"
			When the editor discards their changes
			Then the editor is returned to the read-only layout for edition "uk"
			And no layout has been published

	Rule: Every newsletter can be reordered by keyboard users

		Scenario: Every newsletter has a drag handle
			Then each newsletter in section "News" has an enabled drag handle

		Scenario: Tabbing from a drag handle reaches the Remove button in the same row
			When the editor tabs forward from the drag handle for "Alpha"
			Then the Remove button for "Alpha" has focus
