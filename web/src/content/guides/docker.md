# Установка Docker на Ubuntu

Пошаговая установка Docker Engine и Compose plugin на Ubuntu 22.04 / 24.04. В конце проверим, что демон работает.

## Перед началом

Нужен сервер с Ubuntu и пользователь с правами `sudo`. Обновите индекс пакетов:

```bash
sudo apt update
sudo apt install -y ca-certificates curl
```

## Добавление репозитория Docker

Создайте каталог для ключей и скачайте GPG-ключ официального репозитория:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

Подключите репозиторий:

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
```

## Установка пакетов

Установите Engine, CLI, containerd и Compose plugin:

```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## Проверка

Запустите тестовый контейнер:

```bash
sudo docker run --rm hello-world
```

Если всё ок, в выводе будет сообщение `Hello from Docker!`.

Опционально — добавьте пользователя в группу `docker`, чтобы не писать `sudo`:

```bash
sudo usermod -aG docker "$USER"
```

После этого выйдите из сессии и зайдите снова.

## Полезные команды

| Команда | Что делает |
| --- | --- |
| `docker ps` | Список запущенных контейнеров |
| `docker compose up -d` | Поднять стек из `compose.yml` |
| `docker system df` | Сколько места занято образами |

## Что дальше

- Настройте автозапуск: `sudo systemctl enable --now docker`
- Смотрите гайд по Nginx, когда будете выставлять сервисы наружу
