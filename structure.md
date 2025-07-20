dragonslayer/
├── package.json
├── webpack.config.js
├── src/
│   ├── index.ts       # Точка входа Phaser
│   ├── components/    # Изолированные игровые модули
│   │   ├── Board/     # Игровое поле и сетка клеток
│   │   │   ├── index.ts
│   │   │   ├── Board.ts
│   │   │   └── types.ts
│   │   ├── Entities/  # Логика игровых сущностей (дракон, рыцарь и т.д.)
│   │   │   ├── index.ts
│   │   │   ├── Entity.ts
│   │   │   └── Dragon.ts
│   │   ├── Turn/      # Менеджер пошаговой логики
│   │   │   ├── index.ts
│   │   │   └── TurnManager.ts
│   │   ├── Random/    # Утилиты генерации случайностей
│   │   │   ├── index.ts
│   │   │   └── Randomizer.ts
│   │   └── UI/        # Отображение интерфейса и анимаций
│   │       ├── index.ts
│   │       └── SpriteAnimator.ts
│   └── scenes/        # Phaser Scene-ы
│       ├── BootScene.ts
│       ├── PreloadScene.ts
│       └── GameScene.ts
└── assets/            # Изображения, тайлсеты, спрайт-листы и т.д.