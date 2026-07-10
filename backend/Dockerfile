FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    && docker-php-ext-install pdo pdo_pgsql zip

WORKDIR /app
COPY . .

# Install composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install dependencies if composer.json exists
RUN if [ -f "composer.json" ]; then composer install --no-interaction --optimize-autoloader; fi

CMD php artisan serve --host=0.0.0.0 --port=8000
