const db = require('../database/database');

class Tarefa {
  static async criar(tarefa) {
    return new Promise((resolve, reject) => {
      db.get('SELECT MAX(ordem) as maxOrdem FROM Tarefas', (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        
        const novaOrdem = (result?.maxOrdem || 0) + 1;
        
        const sql = `
          INSERT INTO Tarefas (nome, custo, data_limite, ordem) 
          VALUES (?, ?, ?, ?)
        `;
        
        db.run(sql, [
          tarefa.nome,
          tarefa.custo,
          tarefa.data_limite,
          novaOrdem
        ], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...tarefa, ordem: novaOrdem });
          }
        });
      });
    });
  }

  static async listar() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Tarefas ORDER BY ordem';
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async buscarPorId(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Tarefas WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async atualizar(id, dados) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE Tarefas 
        SET nome = ?, custo = ?, data_limite = ? 
        WHERE id = ?
      `;
      
      db.run(sql, [
        dados.nome,
        dados.custo,
        dados.data_limite,
        id
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...dados });
        }
      });
    });
  }

  static async excluir(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT ordem FROM Tarefas WHERE id = ?', [id], (err, tarefa) => {
        if (err) {
          reject(err);
          return;
        }

        db.run('DELETE FROM Tarefas WHERE id = ?', [id], function(err) {
          if (err) {
            reject(err);
            return;
          }

          db.run(
            'UPDATE Tarefas SET ordem = ordem - 1 WHERE ordem > ?',
            [tarefa.ordem],
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(true);
              }
            }
          );
        });
      });
    });
  }
  static async reordenar(id, novaOrdem) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.get('SELECT ordem FROM Tarefas WHERE id = ?', [id], (err, tarefa) => {
        if (err) {
          db.run('ROLLBACK');
          reject(err);
          return;
        }

        const ordemAtual = tarefa.ordem;

        if (ordemAtual === novaOrdem) {
          db.run('ROLLBACK');
          resolve(true);
          return;
        }

        if (novaOrdem > ordemAtual) {
          db.run('UPDATE Tarefas SET ordem = -999 WHERE id = ?', [id], (err) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }

            db.run(
              'UPDATE Tarefas SET ordem = ordem - 1 WHERE ordem > ? AND ordem <= ?',
              [ordemAtual, novaOrdem],
              (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  reject(err);
                  return;
                }

                db.run(
                  'UPDATE Tarefas SET ordem = ? WHERE id = ?',
                  [novaOrdem, id],
                  (err) => {
                    if (err) {
                      db.run('ROLLBACK');
                      reject(err);
                    } else {
                      db.run('COMMIT');
                      resolve(true);
                    }
                  }
                );
              }
            );
          });
        } else {
          db.run('UPDATE Tarefas SET ordem = -998 WHERE id = ?', [id], (err) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }

            db.run(
              'UPDATE Tarefas SET ordem = ordem + 1 WHERE ordem >= ? AND ordem < ?',
              [novaOrdem, ordemAtual],
              (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  reject(err);
                  return;
                }

                db.run(
                  'UPDATE Tarefas SET ordem = ? WHERE id = ?',
                  [novaOrdem, id],
                  (err) => {
                    if (err) {
                      db.run('ROLLBACK');
                      reject(err);
                    } else {
                      db.run('COMMIT');
                      resolve(true);
                    }
                  }
                );
              }
            );
          });
        }
      });
    });
  });
}

  static async buscarPorNome(nome, excluirId = null) {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT COUNT(*) as count FROM Tarefas WHERE nome = ?';
      const params = [nome];
      
      if (excluirId) {
        sql += ' AND id != ?';
        params.push(excluirId);
      }
      
      db.get(sql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.count > 0);
        }
      });
    });
  }

  static async somatorioCustos() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT SUM(custo) as total FROM Tarefas';
      db.get(sql, [], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.total || 0);
        }
      });
    });
  }
}

module.exports = Tarefa;