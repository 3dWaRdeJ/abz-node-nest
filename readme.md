#Тестовое задание на позицию Back-end Developer (NodeJS)

##Описание приложения
для работы приложения необходимо создать файл .env с переменими окружения  
пример полей есть в фале .env.example 

###Миграция и засеивание БД
Для миграции и засеивания БД я использую пакет [sequelize](https://www.npmjs.com/package/sequelize)  
файлы моделей, миграции, засеивателей находится в директории sequelize

####Запуск миграции
для миграции данных нужно запустить скрипт 
```shell script
$ npm run sequelize migrate
```  
или

```shell script
$ ./node_modules/.bin/sequelize-cli db:migrate
```

####Запуск засеивателя
```shell script
$ npm run sequelize seed
```
или
```shell script
$ ./node_modules/.bin/sequelize-cli db:seed:all
```

по умолчанию в БД создастся 2 пользователя

email: admin@test.com
pass: admin

и 

email: root@test.com
pass: root
