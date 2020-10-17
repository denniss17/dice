package nl.dennisschroer.dice.message

import nl.dennisschroer.dice.model.Die

data class DiceThrow (val name: String, val result: List<Pair<Die, Int>>)