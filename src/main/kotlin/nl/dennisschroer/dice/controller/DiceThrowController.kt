package nl.dennisschroer.dice.controller

import nl.dennisschroer.dice.message.DiceThrow
import nl.dennisschroer.dice.message.DiceThrowIntent
import nl.dennisschroer.dice.model.Die
import org.slf4j.LoggerFactory
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.SendTo
import org.springframework.stereotype.Controller
import kotlin.random.Random

@Controller
class DiceThrowController {
    private val log = LoggerFactory.getLogger(javaClass)

    @MessageMapping("/throw")
    @SendTo("/topic/throws")
    fun throwDice(intent: DiceThrowIntent): DiceThrow {
        val diceThrow = DiceThrow(intent.name, intent.dice.take(10).map { die -> Pair(die, throwDie(die)) })
        log.info(diceThrow.toString())
        return diceThrow
    }

    private fun throwDie(die: Die): Int = Random.nextInt(0, die.sides) + 1
}