from flask import Flask, flash, jsonify, redirect, render_template, request, url_for
import random, json, unicodedata, re, json
from werkzeug import Response
import os

app = Flask(__name__,template_folder='templates', static_folder='static')
app.config['SECRET_KEY'] = 'acd3397cf45c2570af12e2412498db7ce3009341affd18d3'



with open('football_riddles.json', 'r', encoding='utf-8') as f:
    riddles = json.load(f)

@app.route('/', methods = ['POST', 'GET'])
def home():
    riddle = random.choice(riddles)
    return render_template('index.html', riddle=riddle)


@app.route('/riddles/<level>/start', methods=['GET', 'POST'])
def fetch_riddles(level):
    return render_template('riddles.html', level = level)


@app.route('/get_riddles/<difficulty>')
def send_riddles(difficulty):
    filtered = [p for p in riddles if p['difficulty'] ==  difficulty]
    # k = 5 if difficulty == 'easy' else 10 if difficulty == 'medium' else 15
    selected = random.sample(filtered, 5)
    return jsonify(selected)


@app.route('/riddle/<get_id>/answer/', methods=['POST'])
def check_answer(get_id) -> Response:
    riddle = next(filter(lambda r: r['id'] == get_id, riddles), None)
    answers = riddle['answers']
    guess_answer = request.form['answer']
    if matches(guess_answer, answers):
        flash('✅ Correct!',category='success')
    else:
        flash(f"Wrong! Answer was {answers[0]}", category='danger')
    return redirect(url_for('home'))


def normalize_name(s: str) -> str:
    s = s.strip().lower()
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = s.replace('’', '').replace("'", '')
    s = re.sub(r'[^a-z0-9]', '', s)  
    return s

def matches(user_answer, correct_answers) -> bool:
    normalized_user = normalize_name(user_answer)
    return any(map(lambda ans: normalized_user == normalize_name(ans), correct_answers))

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)
   