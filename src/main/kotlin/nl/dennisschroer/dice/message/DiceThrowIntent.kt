package nl.dennisschroer.dice.message

import nl.dennisschroer.dice.model.Die

data class DiceThrowIntent (val name: String, val dice: List<Die>)