package nl.dennisschroer.dice.controller

import nl.dennisschroer.dice.message.DiceThrow
import nl.dennisschroer.dice.message.DiceThrowIntent
import nl.dennisschroer.dice.model.Die
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.SendTo
import org.springframework.stereotype.Controller
import kotlin.random.Random

@Controller
class DiceThrowController {
    @MessageMapping("/throw")
    @SendTo("/topic/throws")
    fun throwDice(intent: DiceThrowIntent): DiceThrow {
        return DiceThrow(intent.name, intent.dice.take(10).map { die -> Pair(die, throwDie(die)) })
    }

    private fun throwDie(die: Die): Int = Random.nextInt(0, die.sides) + 1
}