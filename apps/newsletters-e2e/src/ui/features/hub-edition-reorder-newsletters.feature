Feature: Reorder newsletters in an edition hub layout section
	As an editor
	I want to drag newsletters into a different order, or into another section
	So that they appear in that order when the layout is published

	Background:
		Given the editor is using the Stand workspace

	# These scenarios stub the API so they can focus on the editor's behaviour.
	Rule: A newsletter can be moved with the keyboard or the mouse

		Background:
			Given the editor is editing the "uk" layout with section "News" listing "Alpha, Beta, Gamma"

		Scenario: Moving newsletters up and down with the keyboard
			When the editor moves "Alpha" below "Gamma" using the keyboard
			Then the sections list:
				| News  |
				| Beta  |
				| Gamma |
				| Alpha |
			When the editor moves "Alpha" above "Beta" using the keyboard
			Then the sections list:
				| News  |
				| Alpha |
				| Beta  |
				| Gamma |

		Scenario: Moving newsletters up and down with the mouse
			When the editor moves "Alpha" below "Beta" using the mouse
			Then the sections list:
				| News  |
				| Beta  |
				| Alpha |
				| Gamma |
			When the editor moves "Gamma" above "Beta" using the mouse
			Then the sections list:
				| News  |
				| Gamma |
				| Beta  |
				| Alpha |

		Scenario: Dropping a newsletter outside the section leaves the order unchanged
			When the editor drops "Alpha" outside the section using the mouse
			Then the sections list:
				| News  |
				| Alpha |
				| Beta  |
				| Gamma |

		Scenario: Cancelling a keyboard move leaves the order unchanged
			When the editor cancels a keyboard move of "Alpha"
			Then the sections list:
				| News  |
				| Alpha |
				| Beta  |
				| Gamma |

		Scenario: Tabbing from a drag handle reaches the Remove button in the same row
			When the editor tabs forward from the drag handle for "Alpha"
			Then the Remove button for "Alpha" has focus

	Rule: A newsletter can be moved to another section

		Background:
			Given the editor is editing the "uk" layout with sections:
				| News  | Sport | Empty |
				| Alpha | Gamma |       |
				| Beta  |       |       |

		Scenario: Moving newsletters between sections with the keyboard
			When the editor moves "Alpha" below "Gamma" using the keyboard
			Then the sections list:
				| News | Sport | Empty |
				| Beta | Gamma |       |
				|      | Alpha |       |
			When the editor moves "Gamma" above "Beta" using the keyboard
			Then the sections list:
				| News  | Sport | Empty |
				| Gamma | Alpha |       |
				| Beta  |       |       |

		Scenario: Moving newsletters between sections with the mouse
			When the editor moves "Gamma" above "Beta" using the mouse
			Then the sections list:
				| News  | Sport | Empty |
				| Alpha |       |       |
				| Gamma |       |       |
				| Beta  |       |       |
			When the editor drops "Beta" into the empty section "Empty" using the mouse
			Then the sections list:
				| News  | Sport | Empty |
				| Alpha |       | Beta  |
				| Gamma |       |       |

	# Uses the real API and storage.
	Rule: A new order is only saved when the layout is published

		Scenario: Publishing saves the new order
			Given the "uk" layout has section "News" listing stored newsletters "Alpha, Beta, Gamma"
			And the editor opens the "uk" layout for editing
			When the editor moves "Alpha" below "Beta" using the keyboard
			And the editor publishes the layout
			Then the editor is returned to the read-only layout for edition "uk"
			When the editor opens the "uk" layout for editing
			Then the sections list:
				| News  |
				| Beta  |
				| Alpha |
				| Gamma |
