## Proper Use Of Status Effects

Status effects are the only system that should be used to store information between turns.
This is to ensure "mocking" cards like Rendog Rare and ZombieCleo Rare work correctly.

### Adding a New Status Effect

To create a status effect, create a file in `common/status-effects/`. Be sure to add the status effect
to the list in `common/status-effects/index.ts`. Otherwise, it will not work.

### Applying a Status Effect

Status effects can be applied to ALL card types, though most commonly they will be applied
to hermit cards. Applying a status effect requires two steps, first a component must be created,
then the effect can be applied to a card. In the following example, `creator` is the entity
of the component that created the status effect. This should be a card entity. `target` is
the entity of the card to apply this status effect to.

```ts
import StatusEffectComponent from 'common/components/status-effect-component'
import SleepingEffect from 'common/status-effects/sleeping'

target = game.components.find

game.components
	# Create the status effect component
	.new(StatusEffectComponent, SleepingEffect, creator.entity)
	# Apply the status effect to a card
	.apply(target.entity)
```

